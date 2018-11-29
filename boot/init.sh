#! /bin/bash
LOG=/var/log/launch-$(date '+%Y%m%d-%H%M%S').log
exec > $LOG
exec 2>&1
set -x
set -e
cd /root

echo "$(date) $0"
apt -y update
echo "don't bother updating what we don't use: remove it!"

echo "update ubuntu"
apt list --upgradable
apt -y full-upgrade
apt -y install vim
apt -y autoremove

chmod go-r ~/.ssh/*

# set hostname
hostname $(ec2metadata --local-hostname | sed 's/\..*//')
echo $(hostname) > /etc/hostname
sed -i "s/127.0.0.1\t.*/127.0.0.1\tlocalhost,$(hostname)/" /etc/hosts

# grab the repo
apt -y install git
git clone --depth=1 https://github.com/boyle/2018-measure-stress.git
D=2018-measure-stress/boot

echo "--- ssh ---"
FIRST_USER=$(head -1 authorized_keys  | cut -d' ' -f3 | cut -d@ -f1)
grep -e " ${FIRST_USER}@" $D/authorized_keys > ~/.ssh/authorized_keys
uname -a
ufw --force enable
ufw allow ssh
ufw status

echo "--- create users ---"
$D/create_users.sh $D/authorized_keys

echo "--- create user prime: the nearly root ---"
sudouser=boyle
[ $(grep -c "^${sudouser}" /etc/passwd) -ge 1 ] && usermod -aG sudo ${sudouser}
echo "${sudouser} ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/99-${sudouser}
chmod 0440 /etc/sudoers.d/99-${sudouser}

# do node specific build
F=$D/default.sh
# take instance name, trim off domain and any node numbering
Fs="$D/$(ec2metadata --local-hostname | sed 's/\(-[0-9][0-9]*\)*\..*//').sh"
[ ! -x "$Fs" ] || F=$Fs
echo "$(basename $0) completed. Jumping to ${F}."
exec ./${F}
