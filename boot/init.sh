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
#apt-get -y remove wpasupplicant wireless-tools vino usb-creator-gtk \
#  usb-creator-common transmission-gtk transmission-common totem-plugins \
#  totem-common totem thunderbird-locale-en-us thunderbird-locale-en \
#  thunderbird-gnome-support thunderbird rhythmbox \
#  sound-icons sound-theme-freedesktop speech-dispatcher \
#  speech-dispatcher-audio-plugins speech-dispatcher-espeak-ng spice-vdagent \
#  ubuntu-wallpapers ubuntu-wallpapers-bionic ubuntu-sounds rhythmbox-data \
#  mobile-broadband-provider-info media-player-info
#apt-get -y purge printer-driver-* libx11.* libqt.* xfonts-* libwacom* \
#  libvorbis* libtotem* libspeex* libreoffice* gnome* xserver-*
#apt-get -y autoremove

echo "update ubuntu"
apt list --upgradable
apt -y full-upgrade
apt -y install vim
apt -y autoremove

# private key for github read-only access, necessary for private repo
# from github.com:boyle/2018-measure-stress.git/boot/id_rsa-deploykey
cat > ~/.ssh/id_rsa <<EOF
-----BEGIN RSA PRIVATE KEY-----
MIIEogIBAAKCAQEAwxNPu+PAO0D5TK1jhfkhiEMeFome8nsZrpSvWZvXf8T5E9tm
LDw/+kDN09tKtJX9x98yFhowHxyHobQoH/J9t3kvPTZ2kabcvKegmuhEbHOjMarY
xKPnn0DYbmFHGdJSvodnetuWTY1nJKqBNKrGSH1DHb6avEpbmT3sPKYO+V7SjILK
HsQQIcKYt69SruEHN9qX9C0K8nfsbz/EAl3pRw3WddnMU1DRHP0Fx0pSL3l5h+5Q
lg4rzuWkaN/slghc/gpKD5VI7pnu/YOkwFKk9NyqL9DPPypR/DlZBO/Q2b26jEXx
jaObQtcLZbb4YjTDuAVV/rA3ieILjkVkS9X+OQIDAQABAoIBACWQdm4r8Tx3yonl
aaDG1Jo0snqMjbsL0Wo433tV8y17dKtKOGaUQ42hJQGC3OPhbjkq1a5D5LhY+hU9
Z+ye+W53O42CC1sI0sDRVq/9wg9QRUCvMYbMOTIFfqfiu5pRUfW2hUq3Nj5A2HfL
DY5ixEP5Ow9jQNC5UOI1dmRHZeLG9Xk2r64KJ3kxp3PCG3c761or1oa6B2CjBWJl
XrpWxUu1+N7Skm60F0FCiw+eG/iPirLACrZqofTSu8K/J071ez6xG2xYnsjT+rKX
0LE1psADKaP0NaKGlZTuovk2cm1PtzN5mb9kwXBYnhL5Jv8zzl0HC+KwBvWXaIos
ozyBDnECgYEA7E7/FvIPirsYFLLl3ySPNHRIRM8SS4hpvYXX788dkmJYWTNGBSXO
xfxD9nqHAlDI+O3MxXocu7TfaaslThj/QDeTabNs/uqOPsZJqdYqfcUrYuyKL2rA
Hj7XIX4YY7hZ7qNRcioEEfocVIXEur2Yoc9AJKe6MlmElIdhJcRk8D8CgYEA01S3
sXS4oOvLsHSRUUWGROMSG5eqFM0+A/WaHRIdiY5jxLqtZKWLqNavj0vtg4CoKOxa
OzdsMl1GuYjY18/yGtMIuaBQokST7wxAfGUef4PgyyKJ26gGuJPVw3+Cj2B5XqEh
BO1Zk2eFb820iJwyDKImI0RhqTkpVEQ11/GRc4cCgYAoAWuwH8S/0NLP1kWSVGcm
EzWU6JWJUgvMuRcIk0DHYnzghQyqnG74F7ANz0qB+tk7Q07yc6zfnkxgYEgNg6/a
2E3NjEG8mksAl6Mq7IX/Ct1AfxkZ0/G4bR0Qn39Tioc3HlEQicpsnLIlIQxgLO7l
HegXDIo6Met/Fbg9o5UPEwKBgAXmqbJ01er4apmkx6IDVPp7dLf8hi1Khd7KbuE8
7kI3DaYiqFDVJo8yX3ia4Cj54Lgz0Vkx9P17CUyI+7UbA2GoXugACABf9dmI+AwB
LtbUseQ6NKtDh9yDlEZ/OwAR65Gu4iMnFYc+LsWucsoVwngD1xjJAgkdpX/K384F
2s/lAoGAMgFP5JaD1YkfSSw1fB7XpRXG/L4YyupidAXLukNfFDNlNpF5qphRpJRN
SkSBhcQxxY1UJty2soGfzwED9vNQ4nX1H/nTbOAIJ51awp36mldpCohxwxQDcrKm
Wzmlsb6DQAqpFhN39FAtV+WMyAVOiW8cB0FYhVKSZsUHjvbxXXY=
-----END RSA PRIVATE KEY-----
EOF
cat > ~/.ssh/config <<EOF
VerifyHostKeyDNS yes
StrictHostKeyChecking no
EOF
chmod go-r ~/.ssh/*

# set hostname
hostname $(ec2metadata --local-hostname | sed 's/\..*//')
echo $(hostname) > /etc/hostname
sed -i "s/127.0.0.1\t.*/127.0.0.1\tlocalhost,$(hostname)/" /etc/hosts

# grab the repo
apt -y install git
git clone --depth=1 git@github.com:boyle/2018-measure-stress.git
D=2018-measure-stress/boot

# do node specific build
F=$D/default.sh
# take instance name, trim off domain and any node numbering
Fs="$D/$(ec2metadata --local-hostname | sed 's/\(-[0-9][0-9]*\)*\..*//').sh"
[ ! -x "$Fs" ] || F=$Fs
exec ./${F}
