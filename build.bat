@echo off
setlocal enabledelayedexpansion

echo =====================================================================
echo    Z.E.R.O. 1-KLIK BUILD PIPELINE: ZERO BUY.APK (CAPACITOR 8.X)
echo =====================================================================
echo Modul: 02-zero-buy
echo Komandan: Muhammad Asep Solihin
echo.

:: 0. Deteksi Lingkungan Java & Android SDK
if "%JAVA_HOME%"=="" (
    if exist "..\templates\java" (
        for /f "delims=" %%I in ("..\templates\java") do set "JAVA_HOME=%%~fI"
        set "PATH=!JAVA_HOME!\bin;!PATH!"
        echo [INFO] Menautkan JAVA_HOME ke direktori templates: !JAVA_HOME!
    )
)

if "%ANDROID_HOME%"=="" (
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
        set "PATH=!ANDROID_HOME!\platform-tools;!PATH!"
        echo [INFO] Menautkan ANDROID_HOME: !ANDROID_HOME!
    )
)

:: 1. Cek & Install node_modules jika belum ada
if not exist node_modules (
    echo [LANGKAH 0/5] Dependensi belum terpasang. Menjalankan npm install...
    call npm install
    if !errorlevel! neq 0 (
        echo [ERROR] Gagal menjalankan npm install! Periksa koneksi internet.
        pause
        exit /b !errorlevel!
    )
)

:: Tentukan eksekutor Capacitor CLI yang pasti valid
set "CAP_CMD=call .\node_modules\.bin\cap.cmd"
if not exist node_modules\.bin\cap.cmd (
    set "CAP_CMD=call npx @capacitor/cli"
)

:: 2. Bundling www
echo [LANGKAH 1/5] Bundling frontend assets (src -^> www)...
call node build.js
if !errorlevel! neq 0 (
    echo [ERROR] Gagal bundling frontend! Periksa instalasi Node.js.
    pause
    exit /b !errorlevel!
)

:: 3. Tambahkan platform Android jika belum ada
if not exist android (
    echo [LANGKAH 2/5] Menginisialisasi kontainer Android Capacitor...
    !CAP_CMD! add android
    if !errorlevel! neq 0 (
        echo [ERROR] Gagal menambahkan platform android!
        pause
        exit /b !errorlevel!
    )
) else (
    echo [LANGKAH 2/5] Folder platform android sudah terpasang.
)

:: 4. Generate Mipmap Icons & Bersihkan Legacy Assets
echo [LANGKAH 3/5] Menyiapkan ikon native Android ^& membersihkan asset lama...
if exist "android\app\src\main\res\drawable-v24" rmdir /s /q "android\app\src\main\res\drawable-v24" 2>nul
if exist "android\app\src\main\res\drawable-anydpi-v24" rmdir /s /q "android\app\src\main\res\drawable-anydpi-v24" 2>nul
if exist "android\app\src\main\res\drawable\ic_launcher_background.xml" del /f /q "android\app\src\main\res\drawable\ic_launcher_background.xml" 2>nul
for /d %%D in ("android\app\src\main\res\drawable-port-*") do rmdir /s /q "%%D" 2>nul
for /d %%D in ("android\app\src\main\res\drawable-land-*") do (
    if not "%%~nxD"=="drawable-land" rmdir /s /q "%%D" 2>nul
)
if exist generate-icons.ps1 (
    powershell -NoProfile -ExecutionPolicy Bypass -File generate-icons.ps1
)

:: 5. Pastikan android\local.properties memiliki sdk.dir yang valid
if not exist "android\local.properties" (
    echo [INFO] Menyiapkan android\local.properties...
    if exist "%LOCALAPPDATA%\Android\Sdk" (
        echo sdk.dir=C\:/Users/Asep/AppData/Local/Android/Sdk> "android\local.properties"
    )
)

:: 6. Sinkronisasi Capacitor
echo [LANGKAH 4/5] Menyinkronkan aset www ke native android...
!CAP_CMD! sync android
if !errorlevel! neq 0 (
    echo [ERROR] Gagal sinkronisasi Capacitor!
    pause
    exit /b !errorlevel!
)

:: 7. Kompilasi APK dengan Gradle
echo [LANGKAH 5/5] Mengompilasi APK Debug (gradlew assembleDebug)...

:: Bersihkan proses zombie java dan crash log jika ada
echo [INFO] Membersihkan seluruh proses zombie Java di RAM...
taskkill /F /IM java.exe /T 2>nul
if exist "android\hs_err_pid*.log" del /f /q "android\hs_err_pid*.log" 2>nul
for /d %%D in ("%USERPROFILE%\.gradle\wrapper\dists\gradle-8.11.1-all\*") do (
    if exist "%%D\*.lck" del /f /q "%%D\*.lck" 2>nul
)

cd android
echo [INFO] Menjalankan kompilasi APK ultra-hemat RAM (--no-daemon --max-workers=1)...
call gradlew.bat assembleDebug --no-daemon --max-workers=1
set "GRADLE_EXIT=!errorlevel!"
cd ..

if !GRADLE_EXIT! neq 0 (
    echo.
    echo [ERROR] Gagal kompilasi APK!
    echo Catatan: Pastikan Android SDK telah terpasang atau gunakan Android Studio:
    echo        npx cap open android
    pause
    exit /b !GRADLE_EXIT!
)

:: 8. Salin berkas APK final
if exist salin-apk.bat (
    call salin-apk.bat
)

echo.
echo =====================================================================
echo    BUILD ZERO BUY.APK BERHASIL DILAKSANAKAN DENGAN SUKSES!
echo =====================================================================
pause
