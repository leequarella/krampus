 #!/bin/bash

#see which device to install to
echo -n "Please choose a device:
         1) Phone
         2) Emulator
"
read -e DEVICE

if [ $DEVICE == 1 ]; then
#device="D70095da1b7b" #lee phone old os
device="363295DA1B7B00EC" #lee phone new os
echo "Installing on phone."
fi

if [ $DEVICE == 2 ]; then
device="emulator-5554" #emulator
echo "Installing on emulator."
fi


#ant debug builds the application from src
ant debug


#use adb to uninstall the old version and install the new
ADB="/home/leequarella/android_dev/platform-tools/adb"

$ADB -s $device uninstall com.lucidfrog.hellogap
$ADB -s $device install ~/workspace/krampus/android/bin/App-debug.apk
$ADB -s $device shell am start -n com.lucidfrog.hellogap/.App

