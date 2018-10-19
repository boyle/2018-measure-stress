# setup.sh
# Author: Francois Charih <francoischarih@sce.carleton.ca>
#
# Description: Sets up the app so that it can be run on a local computer.
if [ "$#" -ne 1 ]; then
	echo "Usage: ./setup.sh <path to base folder of android sdk>"
	exit
fi

# Install the node modules
npm install --save  react-native@0.57.1 # newest version (0.57.2) causes crashes with Buttons
npm add @babel/runtime
npm i schedule@0.4.0 --save-dev
npm install

# Install the react-native CLI (requires sudo because global)
sudo npm install -g react-native-cli

# Link the react-native-svg library
react-native link react-native-svg

# Set the path to the SDK
echo "sdk.dir=$1" >> android/local.properties
