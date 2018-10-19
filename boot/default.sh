#! /bin/bash
set -ex
echo "==== default build ===="

PUBLIC_IP=$(ec2metadata --public-ipv4)
DOMAIN=localhost
REPO_DIR=2018-measure-stress

echo "--- tensorflow ---"
apt-get -y install python3-dev python3-pip
python3 --version
pip3 --version
pip3 install --upgrade tensorflow
python3 -c "import tensorflow as tf; print(tf.__version__)"

echo "--- email out ---"
debconf-set-selections <<< "postfix postfix/mailname string ${DOMAIN}"
debconf-set-selections <<< "postfix postfix/main_mailer_type string 'Internet Site'"
apt -y install postfix
ufw allow Postfix

echo "--- store data to persistent storage ---"
mkdir -p /data
chown data:data /data
chmod o-rwx /data
touch /data/badmount # this will be hidden by the 'mount' if it is successful
sed -i '/ \/data /d' /etc/fstab
echo "UUID=898aef8e-2b83-4446-bb09-5f6a2b7f48f8 /data   ext4  errors=remount-ro,noexec 0 0" >> /etc/fstab
[ ! -b /dev/vdc ] || mount /data

echo "TODO: data and database snapshots (rsnapshot)"

echo "--- launch completed ---"
