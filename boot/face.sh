#! /bin/bash
set -e
set -x

PUBLIC_IP=$(ec2metadata --public-ipv4)
DOMAIN=localhost
REPO_DIR=2018-measure-stress

apt -y install net-tools curl rsnapshot

echo "--- firewall ---"
uname -a
ufw --force enable
ufw allow http
ufw allow https
ufw allow ssh
ufw status

echo "--- webserver install ---"
apt-get -y install lighttpd php7.2-cgi python3-flask
lighty-enable-mod fastcgi
lighty-enable-mod fastcgi-php
lighty-enable-mod rewrite
lighty-enable-mod accesslog
lighty-enable-mod no-www

cat > /etc/lighttpd/conf-available/50-https-only.conf <<EOF
\$HTTP["scheme"] == "http" {
    # capture vhost name with regex conditiona -> %0 in redirect pattern
    # must be the most inner block to the redirect rule
    \$HTTP["host"] =~ ".*" {
        url.redirect = (".*" => "https://%0\$0")
    }
}
EOF
lighty-enable-mod https-only

systemctl start lighttpd
service lighttpd force-reload

#apt -y install apache2  libapache2-mod-php7.2
#echo "enable apache2 mod_rewrite, mod_headers, mod_env, mod_dir, mod_mime"
#a2enmod rewrite
#a2enmod headers
#a2enmod env
#a2enmod dir
#a2enmod mime

#sed -i 's/\(post_max_size =\) .*/\1 512M/' /etc/php/7.2/apache2/php.ini
#sed -i 's/\(upload_max_filesize =\) .*/\1 512M/' /etc/php/7.2/apache2/php.ini
#sed -i 's/\(memory_limit =\) .*/\1 512M/' /etc/php/7.2/apache2/php.ini

#systemctl reload apache2

echo "--- webpage install ---"
chown -R root:www-data ${REPO_DIR}/www/*
chmod -R go-w ${REPO_DIR}/www/*
mkdir -p /var/www/html
chown www-data:www-data /var/www/html
cp -r ${REPO_DIR}/www/* /var/www/html/

mkdir -p /var/www/uploads
chown www-data:www-data /var/www/uploads
chmod o-rwx /var/www/uploads

echo "--- LetsEncrypt SSL Certificate: https support"
add-apt-repository -y ppa:certbot/certbot
apt-get -y install certbot
name="saans.ca"
certbot certonly -n --webroot -w /var/www/html/ --agree-tos -m 'boyle@sce.carleton.ca' -d ${name} -d www.${name}
lighty-enable-mod ssl
service lighttpd force-reload

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

#echo "--- self-signed SSL certificate ---"
#openssl req -x509 -nodes -days 365 \
#   -subj '/C=CA/O=Carleton University/OU=Org/CN=localhost' \
#   -newkey rsa:2048 -keyout /etc/ssl/private/my.key \
#   -out /etc/ssl/certs/my.crt
#cat /etc/ssl/private/my.key /etc/ssl/certs/my.crt > /etc/lighttpd/server.pem
#service lighttpd force-reload
#a2enmod ssl
#a2ensite default-ssl
#systemctl reload apache2

echo "--- email out ---"
debconf-set-selections <<< "postfix postfix/mailname string ${DOMAIN}"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt -y install postfix
ufw allow Postfix

echo "TODO: store data and database to persistent storage!"

echo "TODO: data and database snapshots (rsnapshot)"

echo "launch completed: $(date)"
