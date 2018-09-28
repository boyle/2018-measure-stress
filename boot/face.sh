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

echo "--- webpage install ---"
apt -y install apache2  libapache2-mod-php7.2
echo "enable apache2 mod_rewrite, mod_headers, mod_env, mod_dir, mod_mime"
a2enmod rewrite
a2enmod headers
a2enmod env
a2enmod dir
a2enmod mime

chown -R root:www-data ${REPO_DIR}/www/*
chmod -R go-w ${REPO_DIR}/www/*
cp -r ${REPO_DIR}/www/* /var/www/html/

mkdir -p /var/www/uploads
chown www-data:www-data /var/www/uploads
chmod o-rwx /var/www/uploads

sed -i 's/\(post_max_size =\) .*/\1 512M/' /etc/php/7.2/apache2/php.ini
sed -i 's/\(upload_max_filesize =\) .*/\1 512M/' /etc/php/7.2/apache2/php.ini
sed -i 's/\(memory_limit =\) .*/\1 512M/' /etc/php/7.2/apache2/php.ini

systemctl start apache2
#systemctl reload apache2

#echo "--- nextcloud install ---"
#apt -y install \
#   mariadb-server \
#   mariadb-client \
#   php7.2-gd \
#   php7.2-json \
#   php7.2-mysql \
#   php7.2-curl \
#   php7.2-mbstring \
#   php7.2-intl \
#   php-imagick \
#   php7.2-xml \
#   php7.2-zip
#echo "TODO missing php7.2-mcrypt"
#VER=14.0.0
#wget https://download.nextcloud.com/server/releases/nextcloud-${VER}.tar.bz2
#wget https://download.nextcloud.com/server/releases/nextcloud-${VER}.tar.bz2.sha256
#wget https://download.nextcloud.com/server/releases/nextcloud-${VER}.tar.bz2.md5
#wget https://download.nextcloud.com/server/releases/nextcloud-${VER}.tar.bz2.asc
#wget https://nextcloud.com/nextcloud.asc
#
#md5sum -c nextcloud-${VER}.tar.bz2.md5 < nextcloud-${VER}.tar.bz2
#sha256sum -c nextcloud-${VER}.tar.bz2.sha256 < nextcloud-${VER}.tar.bz2
#gpg --import nextcloud.asc
#gpg --verify nextcloud-${VER}.tar.bz2.asc nextcloud-${VER}.tar.bz2
#tar -xjf nextcloud-${VER}.tar.bz2
#cp -r nextcloud /var/www/html/
#chown -R www-data:www-data /var/www/html/nextcloud/
#
#cd /var/www/html/nextcloud
#cat > /etc/apache2/sites-available/nextcloud.conf <<EOF
#Alias /nextcloud "/var/www/html/nextcloud/"
#<Directory /var/www/html/nextcloud/>
#  Options +FollowSymlinks
#  AllowOverride All
# <IfModule mod_dav.c>
#  Dav off
# </IfModule>
# SetEnv HOME /var/www/html/nextcloud
# SetEnv HTTP_HOME /var/www/html/nextcloud
#</Directory>
#EOF
#ln -s /etc/apache2/sites-available/nextcloud.conf /etc/apache2/sites-enabled/nextcloud.conf
#
#systemctl start mariadb.service
#systemctl enable mariadb.service
#cat > /root/secure-mariadb.sql <<EOF
#UPDATE mysql.user SET Password=PASSWORD('po2mmjjmhbujh#2') WHERE User='root';
#DELETE FROM mysql.user WHERE User='';
#DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
#DROP DATABASE IF EXISTS test;
#DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
#CREATE USER 'nextclouddb'@'localhost' IDENTIFIED BY 'su2per18DD22h';
#CREATE DATABASE nextcloud;
#GRANT ALL PRIVILEGES ON nextcloud.* TO 'nextclouddb'@'localhost';
#FLUSH PRIVILEGES;
#EOF
#mysql -sf --user=root < /root/secure-mariadb.sql
#systemctl restart mariadb.service
#
#sudo -u www-data php occ  maintenance:install --database "mysql" --database-name "nextcloud" --database-user "nextclouddb" --database-pass "su2per18DD22h" --admin-user "nextcloudadmin" --admin-pass "po2mmjjmhbujh#2"
#
#echo "... and install apps"
## sudo -u www-data php occ app:install files_accesscontrol
#
## finds the public IP address and sets it to be 'valid'
#sed -i "/0 => 'localhost',/s/.*/&\
#   1 => '${PUBLIC_IP}',/" /var/www/html/nextcloud/config/config.php
#systemctl start apache2
#
#echo "--- nextcloud email & cache config ---"
#apt -y install php-apcu
#cat > /root/nextcloud1.cfg <<EOF
#  'mail_from_address' => 'nextcloud',
#  'mail_smtpmode' => 'smtp',
#  'mail_smtpauthtype' => 'LOGIN',
#  'mail_domain' => 'localhost',
#  'mail_smtphost' => 'localhost',
#  'mail_smtpport' => '25',
#  'memcache.local' => '\\OC\\Memcache\\APCu',
#EOF
#sed -i "/'instanceid'/r /root/nextcloud1.cfg" \
#   /var/www/html/nextcloud/config/config.php
#cat > /root/nextcloud2.cfg <<EOF
#opcache.enable=1
#opcache.enable_cli=1
#opcache.interned_strings_buffer=8
#opcache.max_accelerated_files=10000
#opcache.memory_consumption=128
#opcache.save_comments=1
#opcache.revalidate_freq=1
#EOF
#sed -i "/\\[opcache\\]/r /root/nextcloud2.cfg" /etc/php/7.2/apache2/php.ini
#systemctl reload apache2

echo "TODO LetsEncrypt SSL Certificate: https support <-- requires domain name"

echo "--- self-signed SSL certificate ---"
a2enmod ssl
a2ensite default-ssl
openssl req -x509 -nodes -days 365 \
   -subj '/C=CA/O=Carleton University/OU=Org/CN=localhost' \
   -newkey rsa:2048 -keyout /etc/ssl/private/my.key \
   -out /etc/ssl/certs/my.crt
systemctl reload apache2

echo "--- email out ---"
debconf-set-selections <<< "postfix postfix/mailname string ${DOMAIN}"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt -y install postfix
ufw allow Postfix

systemctl stop lightdm

echo "TODO: store data and database to persistent storage!"
echo "TODO: data and database snapshots (rsnapshot)"

echo "launch completed: $(date)"
