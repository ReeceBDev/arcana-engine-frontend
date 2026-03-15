# React + TypeScript + Capacitor + Parcel
I created a script to make building an environment easier and semi-automated.
This script lives within './launch-dev-env-android.bat'. It does the following things:
 - Fetches information like local IPv4 for the connected Wireless network (assuming you are connected to only one, anyway.)
 - Hosts a parcel server locally for hosting the web server and replicating over updates instantly upon saving the files within the IDE.
 - Connects wirelessly to a configured mobile device (read the notes below for how to do that).
 - Monitors its own status and retries accordingly.
 - Error messages appear in the console in red. Ensure they are read, as there should be no errors.

To run on PC:
- Launch ./launch-dev-env-android.bat
- Connect to the ip address listed in the parcel console.
    * Replace 0.0.0.0 with "localhost" in the browser.

To run on Android:
- Enable developer settings on the device
- Enable ADB Wireless Debugging 
- Modify ./launch-dev-env-android.bat
  * Set the device port accordingly from the ADB Wireless Debugging menu
  * Set the device ip accordingly from the ADB Wireless Debugging menu
- Launch ./launch-dev-env-android.bat
