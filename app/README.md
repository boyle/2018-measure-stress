# SAANS Annotation App

This is a prototype app of what the SAANS Annotation App could look
like. React-Native allows for rapid prototyping; whether this will be
used for the final app remains to be determined.

## Dependencies

In order to run the app on your local machine, you will need the following:

* Android Studio (including the SDK for Oreo 8.1 and the emulator)
* node.js (and npm)
* react-native-cli (installed globally with npm)

## Set-up 

1. Install the dependencies mentioned above...
2. Find the path to your Android SDK (this can be done by going to *Tools > SDK Manager* and looking for "Android SDK Location" at the top of the window.
3. Run the setup script passing as the only argument that path from step 2:
```
$ ./setup.sh <path_to_your_android_sdk>
```

## Running the app

1. Go to Android Studio and launch the emulator: *Tools > AVD Manager*. You will need to create an emulator. I like to use Oreo (8.1) on a Nexus 9 tablet for development.
2. Launch the emulator.
3. Run the app:
```
$ react-native run-android
```
