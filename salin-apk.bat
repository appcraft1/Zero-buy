@echo off
setlocal

set "SOURCE_APK=android\app\build\outputs\apk\debug\app-debug.apk"
set "DEST_NAME=Zero Buy.apk"
set "CENTRAL_RELEASE=..\00-RELEASE-APK"

echo.
echo [SALIN APK] Memindahkan APK hasil build...

if exist "%SOURCE_APK%" (
    copy /y "%SOURCE_APK%" ".\%DEST_NAME%" >nul
    echo [OK] Salinan APK lokal siap: .\%DEST_NAME%

    if not exist "%CENTRAL_RELEASE%" (
        mkdir "%CENTRAL_RELEASE%" 2>nul
    )

    if exist "%CENTRAL_RELEASE%" (
        copy /y "%SOURCE_APK%" "%CENTRAL_RELEASE%\%DEST_NAME%" >nul
        echo [OK] Salinan APK master siap: %CENTRAL_RELEASE%\%DEST_NAME%
    )
) else (
    echo [WARNING] Berkas build APK belum ditemukan di %SOURCE_APK%
)
