#keytool -genkey -v -keyalg RSA -keysize 2048 -validity 50000 -keystore frogdroid-release-key.keystore


# VARS
keystore_path="/home/leequarella/workspace/android_app_keys/frogdroid-release-key.keystore bin/App-unsigned.apk"
key_alias="frogkey"
starting_app_path="/home/leequarella/workspace/auction_manager/mobile_app/android/WUAH/bin/App-unsigned.apk"
final_app_path="/home/leequarella/workspace/auction_manager/mobile_app/android/WUAH/bin/WUAH.apk"
zipalign="/home/leequarella/android_dev/tools/zipalign"

#remove original final file
rm $final_app_path

#compile unsigned release
ant release


#sign it
jarsigner -verbose -keystore $keystore_path $key_alias
#jarsigner -verify bin/App-unsigned.apk


#use zipalign tool to align bytes for optimized stuffis
$zipalign -v 4 $starting_app_path $final_app_path 
#./zipalign -v 4 ~/workspace/auction_manager/mobile_app/android/WUAH/bin/App-unsigned.apk ~/workspace/auction_manager/mobile_app/android/WUAH/bin/WUAH.apk
