#! /bin/bash
set -ex
echo "==== default build ===="

PUBLIC_IP=$(ec2metadata --public-ipv4)
DOMAIN=localhost
REPO_DIR=2018-measure-stress

echo "--- email out ---"
debconf-set-selections <<< "postfix postfix/mailname string ${DOMAIN}"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt -y install postfix
ufw allow Postfix

echo "--- tensorflow ---"
apt-get -y install python3-dev python3-pip
python3 --version
pip3 --version
pip3 install --upgrade tensorflow
python3 -c "import tensorflow as tf; print(tf.__version__)"

echo "--- store data to persistent storage ---"
mkdir -p /data
chmod 0775 /data
chown root:data /data
touch /data/badmount # this will be hidden by the 'mount' if it is successful
sed -i '/ \/data /d' /etc/fstab
echo "UUID=898aef8e-2b83-4446-bb09-5f6a2b7f48f8 /data   ext4  errors=remount-ro,noexec 0 0" >> /etc/fstab
[ ! -b /dev/vdc ] || mount /data

echo "TODO: data and database snapshots (rsnapshot)"
# backup from adler-server: crontab -l
# 17 5 * * * D=/cubed/cubed/biomed-shared/saans.ca/head/ && mkdir -p ${D} && rsync -ar --delete --delete-excluded --exclude 'lost+found' --exclude '.snapshots' remotebackup@head.saans.ca:/var/www/data/ $D

# diff -u /etc/rsnapshot.conf.orig /etc/rsnapshot.conf > /root/rsnapshot.conf.diff
cat > /root/rsnapshot.conf.diff << EOF
--- /etc/rsnapshot.conf.orig	2018-11-15 16:14:51.874943525 -0500
+++ /etc/rsnapshot.conf	2018-11-15 16:17:11.059362886 -0500
@@ -20,7 +20,7 @@
 
 # All snapshots will be stored under this root directory.
 #
-snapshot_root	/var/cache/rsnapshot/
+snapshot_root	/data/.snapshots/
 
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
+backup	/data/	localhost/
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

echo "--- launch completed ---"
