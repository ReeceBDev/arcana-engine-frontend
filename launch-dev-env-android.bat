@echo off
setlocal enabledelayedexpansion

:: Android Configuration !! IMPORTANT - SET AS REQUIRED FOR TESTING DEV VS PRODUCTION:
:: NOTE: False is for dev. True is production-ready, and smaller, but might break things, and might be just unnecessary, anyway.
set USE_GRADLE_MINIFY=TRUE

:: User Configuration !! IMPORTANT - MAKE SURE YOU SET THIS EVERY TIME YOU TURN ON THE DEVICE!
set USE_MOBILE_DEVICE=FALSE
set USEUSB=FALSE
set DEVICE_IP=192.168.0.144
set DEVICE_PORT=38923

:: Variables
for /f %%a in ('powershell -command "(Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4).IPAddress"') do set PC_IP=%%a
set PC_PORT=5173
set WEBSERVER_PORT=5173
set HEARTBEAT_INTERVAL=250
set CONNECTION_RETRY_INTERVAL=100
set ADB_CONNECT_TIMEOUT=5000
set WEBSERVER_BIND_TIMEOUT=8000
set WEBSERVER_READY_TIMEOUT=8000
set CHROME_READY_TIMEOUT=8000
set MAX_RETRIES=3
set SYSTEMS_OK=0

echo ====================================
echo Arcana Engine Android - Resilient Dev Environment
echo ====================================
echo.

:: Check prerequisites
echo Checking prerequisites...

where node >nul 2>&1
if errorlevel 1 (
    powershell -command "Write-Host 'node is not installed or not on PATH. Install from https://nodejs.org' -ForegroundColor Red"
    pause
    exit /b 1
)

where npm >nul 2>&1
if errorlevel 1 (
    powershell -command "Write-Host 'npm is not installed or not on PATH.' -ForegroundColor Red"
    pause
    exit /b 1
)

where npx >nul 2>&1
if errorlevel 1 (
    powershell -command "Write-Host 'npx is not installed or not on PATH.' -ForegroundColor Red"
    pause
    exit /b 1
)

if /I "!USE_MOBILE_DEVICE!"=="TRUE" (
    where adb >nul 2>&1
    if errorlevel 1 (
        powershell -command "Write-Host 'adb is not installed or not on PATH. Download from https://developer.android.com/tools/releases/platform-tools' -ForegroundColor Red"
        pause
        exit /b 1
    )
)

:: Check for Java (required by Android SDK / Gradle)
if /I "!USE_MOBILE_DEVICE!"=="TRUE" (
    if defined JAVA_HOME (
        if not exist "%JAVA_HOME%\bin\java.exe" (
            powershell -command "Write-Host 'JAVA_HOME is set but java.exe not found at %JAVA_HOME%\bin. Check your Java installation.' -ForegroundColor Red"
            pause
            exit /b 1
        )
    ) else (
        where java >nul 2>&1
        if errorlevel 1 (
            powershell -command "Write-Host 'Java not found. Install JDK 17+ and set JAVA_HOME.' -ForegroundColor Red"
            pause
            exit /b 1
        )
    )
)

:: Check for Android SDK (required by cap run / native-run)
if /I "!USE_MOBILE_DEVICE!"=="TRUE" (
    set "SDK_FOUND=FALSE"
    if defined ANDROID_HOME (
        if exist "%ANDROID_HOME%\platforms" set "SDK_FOUND=TRUE"
    )
    if "!SDK_FOUND!"=="FALSE" (
        if defined ANDROID_SDK_ROOT (
            if exist "%ANDROID_SDK_ROOT%\platforms" set "SDK_FOUND=TRUE"
        )
    )
    if "!SDK_FOUND!"=="FALSE" (
        if exist "%LOCALAPPDATA%\Android\Sdk\platforms" (
            set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
            set "SDK_FOUND=TRUE"
        )
    )
    if "!SDK_FOUND!"=="FALSE" (
        powershell -command "Write-Host 'Android SDK not found. Install Android Studio from https://developer.android.com/studio and set ANDROID_HOME to the SDK path.' -ForegroundColor Red"
        pause
        exit /b 1
    )
)

:: Check gradle.properties has a valid java.home path (if set)
if /I "!USE_MOBILE_DEVICE!"=="TRUE" (
    set "GRADLE_PROPS=%~dp0android\gradle.properties"
    if exist "%GRADLE_PROPS%" (
        for /f "tokens=2 delims==" %%j in ('findstr /C:"org.gradle.java.home" "%GRADLE_PROPS%" 2^>nul') do (
            set "GRADLE_JAVA_HOME=%%j"
        )
        if defined GRADLE_JAVA_HOME (
            set "GRADLE_JAVA_HOME=!GRADLE_JAVA_HOME:\\=\!"
            if not exist "!GRADLE_JAVA_HOME!\bin\java.exe" (
                powershell -command "Write-Host 'gradle.properties specifies org.gradle.java.home=!GRADLE_JAVA_HOME! but java.exe was not found there.' -ForegroundColor Red"
                powershell -command "Write-Host 'Edit android\gradle.properties and update the path to your JDK installation.' -ForegroundColor Red"
                pause
                exit /b 1
            )
        )
    )
)

echo All prerequisites found.

:: Check dependencies
if not exist "%~dp0node_modules" (
    echo node_modules not found. Running npm install...
    call npm install
    if errorlevel 1 (
        powershell -command "Write-Host 'npm install failed. Run npm install manually.' -ForegroundColor Red"
        pause
        exit /b 1
    )
    echo Dependencies installed successfully.
)

:: Check ADB pairing
if /I not "!USE_MOBILE_DEVICE!"=="TRUE" goto STARTUP
:CHECK_PAIRING
echo.
echo Checking if device is paired and connected...

if /I "%USEUSB%"=="TRUE" (
    echo USB mode - skipping pairing check.
    goto STARTUP
)

call :RESOLVE_TARGET
if defined ADB_TARGET (
    echo Device connected: !ADB_TARGET!
    goto STARTUP
)

powershell -command "Write-Host 'Device %DEVICE_IP%:%DEVICE_PORT% is not paired or connected.' -ForegroundColor Red"
powershell -command "Write-Host 'Please pair your device from within the device''s Wireless Debugging settings menu by scanning the QR code below...' -ForegroundColor Blue"
echo.
"%~dp0bin\adb-wireless.exe" pair
echo.
goto CHECK_PAIRING


:STARTUP
set RETRY_COUNT=0

:STARTUP_RETRY
:: Kill any existing Parcel processes
echo Cleaning up existing processes...
:: Kill any process holding the webserver port
echo Releasing port %WEBSERVER_PORT%...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr /R ":%WEBSERVER_PORT%[^0-9]" 2^>nul') do (
    taskkill /F /PID %%a 2>nul
)

:: Also kill node.exe broadly as a sweep
taskkill /F /IM node.exe 2>nul
taskkill /F /IM npm.cmd 2>nul
echo Waiting for port to be released...

:: Wait for port to be free
for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set START_TIME=%%t

:WAIT_PORT_FREE
netstat -ano | findstr /R ":%WEBSERVER_PORT%[^0-9]" >nul
if not errorlevel 1 (
    powershell -command "Start-Sleep -Milliseconds %CONNECTION_RETRY_INTERVAL%"
    for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set NOW=%%t
    set /a ELAPSED=!NOW!-!START_TIME!
    set /a PORT_TIMEOUT_SECS=%WEBSERVER_BIND_TIMEOUT% / 1000
    if !ELAPSED! gtr !PORT_TIMEOUT_SECS! (
        powershell -command "Write-Host 'Port %WEBSERVER_PORT% could not be freed after %WEBSERVER_BIND_TIMEOUT%ms.' -ForegroundColor Red"
        set /a RETRY_COUNT+=1
        if !RETRY_COUNT! gtr !MAX_RETRIES! (
            powershell -command "Write-Host 'Exceeded max retries (%MAX_RETRIES%) for port release. Aborting.' -ForegroundColor Red"
            pause
            exit /b 1
        )
        echo Retrying startup attempt !RETRY_COUNT!/!MAX_RETRIES!...
        goto STARTUP_RETRY
    )
    goto WAIT_PORT_FREE
)
echo Port %WEBSERVER_PORT% is now free.
goto CHECK_WEBSERVER


:: ENSURE WEBSERVER IS RUNNING
:CHECK_WEBSERVER
echo Checking Parcel server
netstat -ano | findstr /R ":%WEBSERVER_PORT%[^0-9]" >nul
if errorlevel 1 (
    echo Starting a Parcel WebServer
    start "Parcel Server" cmd /c "cd /d %~dp0 && npm run dev"
    echo Waiting for Parcel to bind to port
    
    for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set BIND_START=%%t
    goto WAIT_SERVER_BIND
) else (
    echo Parcel Webserver: Port is already bound - skipping
)
goto WEBSERVER_ALREADY_RUNNING

:WAIT_SERVER_BIND
powershell -command "Start-Sleep -Milliseconds %CONNECTION_RETRY_INTERVAL%"
netstat -ano | findstr /R ":%WEBSERVER_PORT%[^0-9]" >nul
if not errorlevel 1 goto SERVER_DEPLOYED

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set NOW=%%t
set /a BIND_ELAPSED=!NOW!-!BIND_START!
set /a BIND_TIMEOUT_SECS=%WEBSERVER_BIND_TIMEOUT% / 1000
if !BIND_ELAPSED! gtr !BIND_TIMEOUT_SECS! (
    powershell -command "Write-Host 'Parcel failed to bind after %WEBSERVER_BIND_TIMEOUT%ms.' -ForegroundColor Red"
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! gtr !MAX_RETRIES! (
        powershell -command "Write-Host 'Exceeded max retries (%MAX_RETRIES%) for Parcel startup. Aborting.' -ForegroundColor Red"
        pause
        exit /b 1
    )
    echo Retrying startup attempt !RETRY_COUNT!/!MAX_RETRIES!...
    goto STARTUP_RETRY
)
goto WAIT_SERVER_BIND

:SERVER_DEPLOYED
echo Server deployed and Port bound! Waiting for Parcel to be ready...

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set READY_START=%%t
goto CHECK_WEBSERVER_READY

:CHECK_WEBSERVER_READY
powershell -command "$timeout = %CONNECTION_RETRY_INTERVAL% / 1000; try { Invoke-WebRequest -Uri 'http://localhost:%WEBSERVER_PORT%' -TimeoutSec $timeout -UseBasicParsing -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 }"
if not errorlevel 1 goto WEBSERVER_READY

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set NOW=%%t
set /a READY_ELAPSED=!NOW!-!READY_START!
set /a READY_TIMEOUT_SECS=%WEBSERVER_READY_TIMEOUT% / 1000
if !READY_ELAPSED! gtr !READY_TIMEOUT_SECS! (
    powershell -command "Write-Host 'Parcel failed to respond after %WEBSERVER_READY_TIMEOUT%ms.' -ForegroundColor Red"
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! gtr !MAX_RETRIES! (
        powershell -command "Write-Host 'Exceeded max retries (%MAX_RETRIES%) for Parcel startup. Aborting.' -ForegroundColor Red"
        pause
        exit /b 1
    )
    echo Retrying startup attempt !RETRY_COUNT!/!MAX_RETRIES!...
    goto STARTUP_RETRY
)
goto CHECK_WEBSERVER_READY

:WEBSERVER_ALREADY_RUNNING
echo Parcel server already running!
goto WEBSERVER_READY

:WEBSERVER_READY
echo Parcel is ready!
set RETRY_COUNT=0
if /I "!USE_MOBILE_DEVICE!"=="TRUE" goto CHECK_DEVICE_CONNECTION
goto MONITOR_LOOP


:: Check ADB Wired Connection
:CHECK_DEVICE_CONNECTION

set SYSTEMS_OK=0
if /I "%USEUSB%"=="TRUE" (
    echo Checking USB ADB connection...
    adb devices | findstr /v "List of devices" | findstr "device" >nul
    if errorlevel 1 (
        powershell -command "Write-Host 'No USB device found.' -ForegroundColor Red"
        powershell -command "Write-Host 'Please connect your device via USB and press any key...' -ForegroundColor Blue"
        pause >nul
        goto CHECK_DEVICE_CONNECTION
    )
    for /f "tokens=1" %%d in ('adb devices ^| findstr /v "List of devices" ^| findstr "device"') do set USB_SERIAL=%%d
    set ADB_TARGET=!USB_SERIAL!
    echo USB device found: !USB_SERIAL!
    goto CONNECT_SUCCESS
)

:: Check ADB Wireless Connection
echo Checking ADB connection...
call :RESOLVE_TARGET
if defined ADB_TARGET (
    echo Device found: !ADB_TARGET!
    goto CONNECT_SUCCESS
)

echo Device not connected. Connecting to %DEVICE_IP%:%DEVICE_PORT%...
adb connect %DEVICE_IP%:%DEVICE_PORT%
echo Waiting for device connection...

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set CONNECT_START=%%t
goto WAIT_CONNECT

:WAIT_CONNECT
powershell -command "Start-Sleep -Milliseconds %CONNECTION_RETRY_INTERVAL%"
call :RESOLVE_TARGET
if defined ADB_TARGET goto CONNECT_SUCCESS

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set NOW=%%t
set /a CONNECT_ELAPSED=!NOW!-!CONNECT_START!
set /a CONNECT_TIMEOUT_SECS=%ADB_CONNECT_TIMEOUT% / 1000
if !CONNECT_ELAPSED! gtr !CONNECT_TIMEOUT_SECS! (
    powershell -command "Write-Host 'Connection timeout after %ADB_CONNECT_TIMEOUT%ms.' -ForegroundColor Red"
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! gtr !MAX_RETRIES! (
        powershell -command "Write-Host 'Exceeded max retries (%MAX_RETRIES%) for device connection. Aborting.' -ForegroundColor Red"
        powershell -command "Write-Host 'If you haven''t paired yet, restart the script and pair when prompted.' -ForegroundColor Red"
        pause
        exit /b 1
    )
    echo Retrying connection attempt !RETRY_COUNT!/!MAX_RETRIES!...
    goto CHECK_DEVICE_CONNECTION
)
goto WAIT_CONNECT

:CONNECT_SUCCESS
echo Device connected!
set RETRY_COUNT=0
goto DEPLOY

:DEPLOY
:: Build and deploy
echo.
echo Building and deploying app...
call npx cap sync

:: call npx cap run android --target %DEVICE_IP%:%DEVICE_PORT% -l --host=%DEVICE_IP% --port %WEBSERVER_PORT%
:: call npx cap run android --target=%DEVICE_IP%:%DEVICE_PORT%
:: NOTE: cap run android always builds assembleDebug (Capacitor CLI has no --build-type/--release option).
call npx cap run android --target !ADB_TARGET! --live-reload --host %PC_IP% --port %PC_PORT%

if errorlevel 1 (
    powershell -command "Write-Host 'Deployment failed.' -ForegroundColor Red"
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! gtr !MAX_RETRIES! (
        powershell -command "Write-Host 'Exceeded max retries (%MAX_RETRIES%) for deployment. Aborting.' -ForegroundColor Red"
        pause
        exit /b 1
    )
    echo Retrying deployment attempt !RETRY_COUNT!/!MAX_RETRIES!...
    goto DEPLOY
)

echo.
echo ====================================
echo App deployed successfully!
echo Monitoring connection and server...
echo Press Ctrl+C to stop
echo ====================================
echo.

set RETRY_COUNT=0
goto MONITOR_LOOP


:: Resolve mDNS target from DEVICE_IP:DEVICE_PORT
:RESOLVE_TARGET
set "ADB_TARGET="
set "ADB_MDNS_NAME="
set "ADB_MDNS_TYPE="
for /f "tokens=1,2" %%a in ('adb mdns services ^| findstr /C:"%DEVICE_IP%:%DEVICE_PORT%"') do (
    set "ADB_MDNS_NAME=%%a"
    set "ADB_MDNS_TYPE=%%b"
)
if not defined ADB_MDNS_NAME goto :eof
set "ADB_TARGET=!ADB_MDNS_NAME!.!ADB_MDNS_TYPE!"
adb devices | findstr /C:"!ADB_TARGET!" | findstr "device" >nul 2>&1
if errorlevel 1 set "ADB_TARGET="
goto :eof


:START_CHROME
:: Check if Chrome is already running
tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
if not errorlevel 1 (
    echo Chrome is already running. Waiting for remote debugging port...
) else (
    echo Starting Chrome with remote debugging...
    start chrome --remote-debugging-port=9222
)

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set CHROME_START=%%t

:WAIT_FOR_CHROME
powershell -command "Start-Sleep -Milliseconds %CONNECTION_RETRY_INTERVAL%"
netstat -ano | findstr ":9222" >nul
if not errorlevel 1 goto CHROME_READY

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set NOW=%%t
set /a CHROME_ELAPSED=!NOW!-!CHROME_START!
set /a CHROME_TIMEOUT_SECS=%CHROME_READY_TIMEOUT% / 1000
if !CHROME_ELAPSED! gtr !CHROME_TIMEOUT_SECS! (
    powershell -command "Write-Host 'Chrome failed to start remote debugging after %CHROME_READY_TIMEOUT%ms.' -ForegroundColor Red"
    powershell -command "Write-Host 'Please restart Chrome with: chrome --remote-debugging-port=9222' -ForegroundColor Red"
    pause
    goto START_CHROME
)
goto WAIT_FOR_CHROME

:CHROME_READY
echo Chrome remote debugging is active on port 9222.

:OPEN_DEVTOOLS
echo Waiting for app page to be available in Chrome DevTools...

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set DEVTOOLS_START=%%t

:WAIT_FOR_DEVTOOLS_PAGE
powershell -command "Start-Sleep -Milliseconds %CONNECTION_RETRY_INTERVAL%"

:: Get the DevTools page ID
set PAGE_ID=
for /f "delims=" %%i in ('powershell -command "(Invoke-WebRequest -Uri 'http://localhost:9222/json' -UseBasicParsing -ErrorAction SilentlyContinue | ConvertFrom-Json | Where-Object { $_.url -like '*%DEVICE_IP%:%WEBSERVER_PORT%*' }).id"') do set PAGE_ID=%%i

if defined PAGE_ID (
    echo Opening DevTools for page: %PAGE_ID%
    start chrome "devtools://devtools/bundled/inspector.html?ws=localhost:9222/devtools/page/%PAGE_ID%"
    goto MONITOR_LOOP
)

for /f %%t in ('powershell -command "[int](Get-Date -UFormat %%s)"') do set NOW=%%t
set /a DEVTOOLS_ELAPSED=!NOW!-!DEVTOOLS_START!
set /a DEVTOOLS_TIMEOUT_SECS=%CHROME_READY_TIMEOUT% / 1000
if !DEVTOOLS_ELAPSED! gtr !DEVTOOLS_TIMEOUT_SECS! (
    powershell -command "Write-Host 'Could not find page ID after %CHROME_READY_TIMEOUT%ms. Opening inspect page as fallback...' -ForegroundColor Red"
    start chrome chrome://inspect/#devices
    goto MONITOR_LOOP
)
goto WAIT_FOR_DEVTOOLS_PAGE


:MONITOR_LOOP
powershell -command "Start-Sleep -Milliseconds %HEARTBEAT_INTERVAL%"

:: Check ADB connection
if /I not "!USE_MOBILE_DEVICE!"=="TRUE" goto MONITOR_CHECK_PARCEL
adb devices | findstr /C:"!ADB_TARGET!" >nul
if errorlevel 1 (
    set SYSTEMS_OK=0
    echo !time! - Device disconnected! Reconnecting...
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! gtr !MAX_RETRIES! (
        powershell -command "Write-Host 'Exceeded max retries (%MAX_RETRIES%) for reconnection. Aborting.' -ForegroundColor Red"
        pause
        exit /b 1
    )
    goto CHECK_DEVICE_CONNECTION
)

:: Check Parcel server
:MONITOR_CHECK_PARCEL
powershell -command "$timeout = %CONNECTION_RETRY_INTERVAL% / 1000; try { Invoke-WebRequest -Uri 'http://localhost:%WEBSERVER_PORT%' -TimeoutSec $timeout -UseBasicParsing -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
    set SYSTEMS_OK=0
    echo !time! - Parcel server died! Restarting...
    set /a RETRY_COUNT+=1
    if !RETRY_COUNT! gtr !MAX_RETRIES! (
        powershell -command "Write-Host 'Exceeded max retries (%MAX_RETRIES%) for Parcel recovery. Aborting.' -ForegroundColor Red"
        pause
        exit /b 1
    )
    goto CHECK_WEBSERVER
)

:: Check if app is running
if /I not "!USE_MOBILE_DEVICE!"=="TRUE" goto MONITOR_REPORT
adb -s !ADB_TARGET! shell "pidof com.arcanaengine.client" >nul 2>&1
if errorlevel 1 (
    set SYSTEMS_OK=0
    echo !time! - App not running on device. Relaunching...
    adb -s !ADB_TARGET! shell am start -n com.arcanaengine.client/com.arcanaengine.client.MainActivity
    if errorlevel 1 (
        powershell -command "Write-Host 'Failed to launch app. Full redeploy needed.' -ForegroundColor Red"
        set /a RETRY_COUNT+=1
        if !RETRY_COUNT! gtr !MAX_RETRIES! (
            powershell -command "Write-Host 'Exceeded max retries (%MAX_RETRIES%) for app recovery. Aborting.' -ForegroundColor Red"
            pause
            exit /b 1
        )
        goto DEPLOY
    )
)

REM :: Ensure Chrome is running with remote debugging
REM netstat -ano | findstr ":9222" >nul
REM if errorlevel 1 (
    REM :: Check if Chrome is running at all
    REM tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
    REM if errorlevel 1 (
        REM echo Chrome not running. Starting with remote debugging...
		REM goto START_CHROME
    REM ) else (
        REM echo Chrome is running but port 9222 not active. Starting chrome.
		REM goto START_CHROME
    REM )
REM )

REM :: Check if DevTools is already open
REM powershell -command "Get-Process chrome -ErrorAction SilentlyContinue | ForEach-Object { $_.MainWindowTitle } | Where-Object { $_ -like '*DevTools*' }" >nul 2>&1
REM if errorlevel 1 (
    REM echo DevTools not open. Opening...
    REM goto OPEN_DEVTOOLS
REM )

:MONITOR_REPORT
if not !SYSTEMS_OK! equ 0 goto MONITOR_LOOP
if /I "!USE_MOBILE_DEVICE!"=="TRUE" echo !time! - All systems operational - Device: Connected, Parcel: Running, App: Active
if /I not "!USE_MOBILE_DEVICE!"=="TRUE" echo !time! - All systems operational - Parcel: Running
set SYSTEMS_OK=1

goto MONITOR_LOOP