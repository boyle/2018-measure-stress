#! /bin/bash
# if [ "$#" -ne 1 ]; then
# 	echo "Usage: ./setup.sh <path to base folder of android sdk>"
# 	exit
# fi

set -e
set -x

# https://medium.com/@dooboolab/running-react-native-app-in-ubuntu-18-04-7d1db4ac7518

# clean out an outdated installation
#sudo apt-get -y remove --purge nodejs npm
#sudo apt-get -y clean
#sudo apt-get -y autoclean
#sudo apt-get -y install -f
#sudo apt-get -y autoremove

echo "get an Android emulator setup..."
# https://stackoverflow.com/questions/34556884/how-to-install-android-sdk-on-ubuntu
sudo apt-get install cpu-checker
egrep -c '(vmx|svm)' /proc/cpuinfo
kvm-ok
sudo apt-get install qemu-kvm libvirt-bin ubuntu-vm-builder bridge-utils adb
sudo snap install android-studio --classic
# launch "android-studio", follow the menus/dialoges <click>-ing on the appropriate plcaes
# File > Settings <click>
#   Appearance & Behaviour > System Settings > Android SDK <click>
#   in the pane: Android SDK Location > Edit <click>
#   ... default (e.g. "Android 28 (Pie)" > Next <click>
#   ... Downloading Components (~1 GB)) ... (wiat for download) ... Finish <click>
#      ... optionally, download Android 8.1 (Test target)
#      ... optionally, download Android 8.0 (Galaxy S7)
#   click "AVD Manager" button on toolbar (look at tooltips)
#   "+ Create Virtual Device" <click>
#     --> "Tablet" <click>  >> "Nexus 9" <click>
#        >> "Next" <click>
#     --> "Oreo" <click> on "Download" ... doesn't seem to see the previously downloaded version in Android SDK?
#     --> Finish
#     --> "Portrait" & set AVD Name: "Tablet" ... or something easy
#     "Finish"
#  --> "Run" from "Your Virtual Devices"
#    ... and waiiiit
#
#
#  from cmd line in the "app" directory
#  $ npm start &
#  $ react-native run-android
#
#
# if missing linux 32-bit binaries:
# sudo apt-get install libc6:i386 libncurses5:i386 libstdc++6:i386 lib32z1
#
# configure emulator


v=10   # set to 4, 5, 6, ... as needed
curl -sL https://deb.nodesource.com/setup_$v.x | sudo -E bash -
sudo apt-get update -y
sudo apt-get install -y nodejs

curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
sudo apt-get -y update
#sudo apt-get -y install yarn

# Install node js
#sudo apt-get install -y npm  ... but already installed by nodejs?
sudo npm install -g yarn

# Install the node modules (dependencies)
yarn install

# launch the app
#   yarn start
# or in the case of broken ncurses
# https://bugs.gentoo.org/648720
# https://github.com/gradle/gradle/issues/4426
#   TERM=xterm-color react-native run-android
