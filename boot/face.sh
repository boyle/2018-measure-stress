#! /bin/bash
set -e
set -x

PUBLIC_IP=$(ec2metadata --public-ipv4)
DOMAIN=localhost
REPO_DIR=2018-measure-stress

apt -y install net-tools curl rsnapshot

echo "--- firewall ---"
ufw allow http
ufw allow https
ufw status

echo "--- webserver install ---"
apt-get -y install lighttpd python3-flask
lighty-enable-mod fastcgi
lighty-enable-mod rewrite
lighty-enable-mod accesslog

systemctl start lighttpd
service lighttpd force-reload

echo "--- webpage install ---"
chown -R root:www-data ${REPO_DIR}/www/*
chmod -R go-w ${REPO_DIR}/www/*
mkdir -p /var/www/html
chown www-data:www-data /var/www/html
cp -r ${REPO_DIR}/www/* /var/www/html/

echo "--- enable dynamic pages via python/flask/jinja2/... ---"
apt-get -y install python3-dev python3-pip python-virtualenv python3-venv
python3 --version
pip3 --version
pip3 install --upgrade flipflop

cat > /etc/lighttpd/conf-available/15-saans-http.conf << EOF
fastcgi.server += ( "/app.fcgi" =>
    ((
        "socket" => "/tmp/flaskapp.fastcgi.socket",
        "bin-path" => "/var/www/html/app.fcgi",
        "max-procs" => 1,
        "check-local" => "disable",
    ))
)
alias.url = (
    "/static" => "/var/www/html/bikeshed/static"
)
\$HTTP["host"] =~ "^www\\.(saans\\.ca)$" {
    url.redirect = ( "^/(.*)" => "http://%1/\$1" )
}
\$HTTP["host"] =~ "^api\\.saans\\.ca$" {
    url.rewrite-once = (
        "^/$" => "/app.fcgi/api",
        "^(/.*)$" => "/app.fcgi/api\$1",
    )
}
\$HTTP["host"] =~ "^saans\\.ca$" {
    url.rewrite-once = (
        "^(/static.*)$" => "\$1",
        "^(/.*)$" => "/app.fcgi\$1",
    )
}
EOF

cat > /etc/lighttpd/conf-available/15-saans-https.conf << EOF
fastcgi.server += ( "/app.fcgi" =>
    ((
        "socket" => "/tmp/flaskapp.fastcgi.socket",
        "bin-path" => "/var/www/html/app.fcgi",
        "max-procs" => 1,
        "check-local" => "disable",
    ))
)
alias.url = (
    "/static" => "/var/www/html/bikeshed/static"
)
\$HTTP["scheme"] == "http" {
    \$HTTP["host"] =~ ".*" {
        url.redirect = (".*" => "https://%0\$0")
    }
}
\$HTTP["scheme"] == "https" {
    \$HTTP["host"] =~ "^www\\.(saans\\.ca)$" {
        url.redirect = ( "^/(.*)" => "http://%1/\$1" )
    }
    \$HTTP["host"] =~ "^api\\.saans\\.ca$" {
        url.rewrite-once = (
            "^/$" => "/app.fcgi/api",
            "^(/.*)$" => "/app.fcgi/api\$1",
        )
    }
    \$HTTP["host"] =~ "^saans\\.ca$" {
        url.rewrite-once = (
            "^(/static.*)$" => "\$1",
            "^(/.*)$" => "/app.fcgi\$1",
        )
    }
}
EOF
lighty-enable-mod saans-http
service lighttpd force-reload

echo "--- LetsEncrypt SSL Certificate: https support"
add-apt-repository -y ppa:certbot/certbot
apt-get -y install certbot
name="saans.ca"
certbot certonly -n --webroot -w /var/www/html/ --agree-tos -m 'boyle@sce.carleton.ca' -d ${name} -d www.${name} -d api.${name}

cat > /etc/cron.daily/renew-ssl <<EOF
#! /bin/bash
/usr/bin/certbot renew --quiet
cd /etc/letsencrypt/live
for d in *; do
   [ ! -d "\$d" ] && continue
   pushd "\$d" > /dev/null
   cat privkey.pem cert.pem > /etc/lighttpd/\$d.pem
   cp fullchain.pem /etc/lighttpd/
   popd > /dev/null
done
cd /etc/lighttpd/
ln -sf \$d.pem server.pem
service lighttpd force-reload
EOF
chmod +x /etc/cron.daily/renew-ssl
/etc/cron.daily/renew-ssl

# now we have the SSL certificate, its safe to force https-only
lighty-enable-mod  ssl
lighty-disable-mod saans-http
lighty-enable-mod  saans-https
service lighttpd   force-reload

echo "--- email out ---"
debconf-set-selections <<< "postfix postfix/mailname string ${DOMAIN}"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt -y install postfix
ufw allow Postfix

echo "--- store raw data to persistent storage ---"
mkdir -p /var/www/rawdata
touch /var/www/rawdata/badmount # this will be hidden by the 'mount' if it is successful
chown -R www-data:data /var/www/rawdata
chmod -R o-rwx /var/www/rawdata
sed -i '/ \/var\/www\/rawdata /d' /etc/fstab
echo "UUID=ac2c7603-e407-4ee6-be14-9105aba53e7f /var/www/rawdata   ext4  errors=remount-ro,noexec 0 0" >> /etc/fstab
[ ! -b /dev/vdc ] || mount /var/www/rawdata

echo "database snapshots setup"
apt -y install postgresql postgresql-contrib postgresql-server-dev-all
DBUSER=saansuser
DB=saansdb
DBPASSWD=$(tr -cd '[:alnum:]' < /dev/urandom | fold -w60 | head -n1)
sudo -u postgres psql -c "create database ${DB}"
sudo -u postgres psql -c "create database ${DB}_test"
sudo -u postgres psql -c "create user ${DBUSER} WITH PASSWORD \'${DBPASSWD}\'"
sudo -u postgres psql -c "grant all privileges on database ${DB} to ${DBUSER}"
echo "$DBUSER $DBPASSWD $DB" > ~/dbpasswd.txt
chmod 700 ~/dbpasswd.txt

WEBAPP_SECRET_KEY=$(tr -cd '[:alnum:]' < /dev/urandom | fold -w60 | head -n1)
echo "$WEBAPP_SECRET_KEY" > ~/webapp-secret-key.txt
chmod 700 ~/webapp-secret-key.txt

echo "TODO: data and database snapshots (rsnapshot)"
# backup from adler-server: crontab -l
# 17 5 * * * D=/cubed/cubed/biomed-shared/saans.ca/face/ && mkdir -p ${D} && rsync -ar --delete --delete-excluded --exclude 'lost+found' --exclude '.snapshots' remotebackup@saans.ca:/var/www/rawdata/ $D

# diff -u /etc/rsnapshot.conf.orig /etc/rsnapshot.conf > /root/rsnapshot.conf.diff
cat > /root/rsnapshot.conf.diff << EOF
--- /etc/rsnapshot.conf.orig	2018-11-15 16:14:51.874943525 -0500
+++ /etc/rsnapshot.conf	2018-11-15 16:17:11.059362886 -0500
@@ -20,7 +20,7 @@
 
 # All snapshots will be stored under this root directory.
 #
-snapshot_root	/var/cache/rsnapshot/
+snapshot_root	/var/www/rawdata/.snapshots/
 
 # If no_create_root is enabled, rsnapshot will not automatically create the
 # snapshot_root directory. This is particularly useful if you are backing
@@ -163,6 +163,7 @@
 #include	???
 #exclude	???
 #exclude	???
+exclude	'.snapshots'
 
 # The include_file and exclude_file parameters, if enabled, simply get
 # passed directly to rsync. Please look up the --include-from and
@@ -226,7 +227,8 @@
 # LOCALHOST
 backup	/home/		localhost/
 backup	/etc/		localhost/
-backup	/usr/local/	localhost/
+#backup	/usr/local/	localhost/
+backup	/var/www/rawdata/	localhost/
 #backup	/var/log/rsnapshot		localhost/
 #backup	/etc/passwd	localhost/
 #backup	/home/foo/My Documents/		localhost/
EOF
patch  /etc/rsnapshot.conf < /root/rsnapshot.conf.diff

cat > /etc/cron.d/rsnapshot << EOF
0 */4		* * *		root	/usr/bin/rsnapshot alpha
30 3  	* * *		root	/usr/bin/rsnapshot beta
0  3  	* * 1		root	/usr/bin/rsnapshot gamma
30 2  	1 * *		root	/usr/bin/rsnapshot delta
EOF

echo "launch completed: $(date)"
