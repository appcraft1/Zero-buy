# PowerShell PNG Generator for Zero Buy Android Mipmap Icons & Splash Screen
# Uses .NET System.Drawing for high quality pixel rendering without external dependencies
Add-Type -AssemblyName System.Drawing

$androidRes = Join-Path $PSScriptRoot "android\app\src\main\res"
if (-not (Test-Path $androidRes)) {
    Write-Host "[ICONS] Direktori Android belum di-init. Lewati."
    exit 0
}

Write-Host "[ICONS] Memulai pembuatan ikon native PNG Piko si Kucing Penjaga Dompet..."

# 1. Bersihkan file vektor bawaan Capacitor yang menimpa ikon adaptive Android
$legacyVectors = @(
    (Join-Path $androidRes "drawable-v24\ic_launcher_foreground.xml"),
    (Join-Path $androidRes "drawable-v24\`$ic_launcher_foreground__0.xml"),
    (Join-Path $androidRes "drawable-anydpi-v24\ic_launcher_foreground.xml"),
    (Join-Path $androidRes "drawable-anydpi-v24\`$ic_launcher_foreground__0.xml"),
    (Join-Path $androidRes "drawable\ic_launcher_background.xml")
)
foreach ($vec in $legacyVectors) {
    if (Test-Path $vec) {
        Remove-Item -Path $vec -Force -ErrorAction SilentlyContinue
        Write-Host "  [CLEAN] Dihapus: $vec"
    }
}

# Hapus folder drawable-v24 / drawable-anydpi-v24 jika kosong
$v24Dir = Join-Path $androidRes "drawable-v24"
if ((Test-Path $v24Dir) -and ((Get-ChildItem $v24Dir).Count -eq 0)) {
    Remove-Item -Path $v24Dir -Force -Recurse -ErrorAction SilentlyContinue
}
$anydpi24Dir = Join-Path $androidRes "drawable-anydpi-v24"
if ((Test-Path $anydpi24Dir) -and ((Get-ChildItem $anydpi24Dir).Count -eq 0)) {
    Remove-Item -Path $anydpi24Dir -Force -Recurse -ErrorAction SilentlyContinue
}

# 2. Bersihkan seluruh folder splash bawaan Capacitor (drawable-port-* dan drawable-land-*)
Get-ChildItem -Path $androidRes -Directory -Filter "drawable-port-*" | ForEach-Object {
    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
}
Get-ChildItem -Path $androidRes -Directory -Filter "drawable-land-*" | Where-Object { $_.Name -ne "drawable-land" } | ForEach-Object {
    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

# 3. Pastikan konfigurasi Adaptive Icon mipmap-anydpi-v26 menggunakan @mipmap/ic_launcher_foreground
$anydpi26Dir = Join-Path $androidRes "mipmap-anydpi-v26"
if (-not (Test-Path $anydpi26Dir)) {
    New-Item -ItemType Directory -Path $anydpi26Dir -Force | Out-Null
}
$adaptiveXml = @"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"@
Set-Content -Path (Join-Path $anydpi26Dir "ic_launcher.xml") -Value $adaptiveXml -Encoding UTF8
Set-Content -Path (Join-Path $anydpi26Dir "ic_launcher_round.xml") -Value $adaptiveXml -Encoding UTF8

# 4. Pastikan warna background adaptive icon adalah Warm Cream #FFF5EB (Sesuai Piko & UI In-App)
$valuesDir = Join-Path $androidRes "values"
if (-not (Test-Path $valuesDir)) {
    New-Item -ItemType Directory -Path $valuesDir -Force | Out-Null
}
$bgXml = @"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFF5EB</color>
</resources>
"@
Set-Content -Path (Join-Path $valuesDir "ic_launcher_background.xml") -Value $bgXml -Encoding UTF8

# 5. Fungsi Render Ikon Piko si Kucing Penjaga Dompet (High Fidelity .NET Drawing)
function New-ZeroBuyIcon {
    param(
        [int]$Size,
        [string]$OutFile,
        [bool]$IsRound = $false,
        [bool]$IsForeground = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($Size, $Size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # 1. Background layer
    if ($IsForeground) {
        # Foreground untuk Adaptive Icon harus transparan
        $g.Clear([System.Drawing.Color]::Transparent)
    } elseif ($IsRound) {
        $g.Clear([System.Drawing.Color]::Transparent)
        $brushBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 248, 240))
        $g.FillEllipse($brushBg, 2, 2, $Size - 4, $Size - 4)
        $penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 254, 215, 170), [float][Math]::Max(2, $Size * 0.04))
        $g.DrawEllipse($penBorder, 2, 2, $Size - 4, $Size - 4)
    } else {
        $rect = New-Object System.Drawing.Rectangle(0, 0, $Size, $Size)
        $brushBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 248, 240))
        $g.FillRectangle($brushBg, $rect)
        $penBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 254, 215, 170), [float][Math]::Max(2, $Size * 0.03))
        $g.DrawRectangle($penBorder, 1, 1, $Size - 2, $Size - 2)
    }

    # Titik tengah & dimensi
    $cx = $Size / 2.0
    $cy = $Size / 2.0

    # Skala proporsional: Foreground berukuran ~65% agar berada di dalam safe circular zone (72dp/108dp)
    $scale = if ($IsForeground) { 0.64 } else { 0.78 }
    $w = $Size * $scale
    $h = $Size * $scale

    # 2. Telinga Kucing Piko (Ears)
    # Telinga Kiri Luar (Oranye)
    $earLeftPts = @(
        [System.Drawing.PointF]::new([float]($cx - $w * 0.38), [float]($cy - $h * 0.05)),
        [System.Drawing.PointF]::new([float]($cx - $w * 0.32), [float]($cy - $h * 0.48)),
        [System.Drawing.PointF]::new([float]($cx - $w * 0.08), [float]($cy - $h * 0.28))
    )
    $brushOrange = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 122, 0))
    $g.FillPolygon($brushOrange, $earLeftPts)

    # Telinga Kiri Dalam (Pink Lucu)
    $earLeftInPts = @(
        [System.Drawing.PointF]::new([float]($cx - $w * 0.34), [float]($cy - $h * 0.08)),
        [System.Drawing.PointF]::new([float]($cx - $w * 0.29), [float]($cy - $h * 0.42)),
        [System.Drawing.PointF]::new([float]($cx - $w * 0.12), [float]($cy - $h * 0.26))
    )
    $brushPink = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 170, 166))
    $g.FillPolygon($brushPink, $earLeftInPts)

    # Telinga Kanan Luar (Oranye)
    $earRightPts = @(
        [System.Drawing.PointF]::new([float]($cx + $w * 0.38), [float]($cy - $h * 0.05)),
        [System.Drawing.PointF]::new([float]($cx + $w * 0.32), [float]($cy - $h * 0.48)),
        [System.Drawing.PointF]::new([float]($cx + $w * 0.08), [float]($cy - $h * 0.28))
    )
    $g.FillPolygon($brushOrange, $earRightPts)

    # Telinga Kanan Dalam (Pink Lucu)
    $earRightInPts = @(
        [System.Drawing.PointF]::new([float]($cx + $w * 0.34), [float]($cy - $h * 0.08)),
        [System.Drawing.PointF]::new([float]($cx + $w * 0.29), [float]($cy - $h * 0.42)),
        [System.Drawing.PointF]::new([float]($cx + $w * 0.12), [float]($cy - $h * 0.26))
    )
    $g.FillPolygon($brushPink, $earRightInPts)

    # 3. Kepala Piko (Round Cute Chibi Face)
    $headW = $w * 0.78
    $headH = $h * 0.68
    $g.FillEllipse($brushOrange, [float]($cx - $headW / 2.0), [float]($cy - $headH * 0.54), [float]$headW, [float]$headH)

    # 4. Moncong Putih (White Muzzle)
    $muzzleW = $w * 0.38
    $muzzleH = $h * 0.26
    $brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.FillEllipse($brushWhite, [float]($cx - $muzzleW / 2.0), [float]($cy - $muzzleH * 0.20), [float]$muzzleW, [float]$muzzleH)

    # 5. Pipi Merah Merona (Cheeks Blush)
    $blushW = [Math]::Max(4, $w * 0.14)
    $blushH = [Math]::Max(3, $h * 0.08)
    $brushBlush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(210, 255, 180, 162))
    $g.FillEllipse($brushBlush, [float]($cx - $w * 0.26 - $blushW / 2.0), [float]($cy + $h * 0.04), [float]$blushW, [float]$blushH)
    $g.FillEllipse($brushBlush, [float]($cx + $w * 0.26 - $blushW / 2.0), [float]($cy + $h * 0.04), [float]$blushW, [float]$blushH)

    # 6. Mata Berbinar Anime Kucing (Sparkling Cat Eyes)
    $eyeW = [Math]::Max(3, $w * 0.11)
    $eyeH = [Math]::Max(4, $h * 0.14)
    $brushEye = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 41, 59))
    $g.FillEllipse($brushEye, [float]($cx - $w * 0.16 - $eyeW / 2.0), [float]($cy - $h * 0.14), [float]$eyeW, [float]$eyeH)
    $g.FillEllipse($brushEye, [float]($cx + $w * 0.16 - $eyeW / 2.0), [float]($cy - $h * 0.14), [float]$eyeW, [float]$eyeH)

    # Kilau Bintang Putih di Mata
    $shineR = [Math]::Max(1.5, $eyeW * 0.38)
    $g.FillEllipse($brushWhite, [float]($cx - $w * 0.16 - $shineR * 0.2), [float]($cy - $h * 0.17), [float]$shineR, [float]$shineR)
    $g.FillEllipse($brushWhite, [float]($cx + $w * 0.16 - $shineR * 0.2), [float]($cy - $h * 0.17), [float]$shineR, [float]$shineR)

    # 7. Hidung Cokelat & Mulut Tersenyum 'w'
    $noseW = [Math]::Max(3, $w * 0.07)
    $noseH = [Math]::Max(2, $h * 0.05)
    $brushNose = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 124, 45, 18))
    $g.FillEllipse($brushNose, [float]($cx - $noseW / 2.0), [float]($cy - $h * 0.01), [float]$noseW, [float]$noseH)

    $penMouth = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 124, 45, 18), [float][Math]::Max(1.5, $Size * 0.02))
    $penMouth.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penMouth.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $g.DrawArc($penMouth, [float]($cx - $w * 0.08), [float]($cy + $h * 0.02), [float]($w * 0.08), [float]($h * 0.08), 20, 140)
    $g.DrawArc($penMouth, [float]$cx, [float]($cy + $h * 0.02), [float]($w * 0.08), [float]($h * 0.08), 20, 140)

    # 8. Kumis Kucing (Whiskers)
    $penWhisker = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 194, 65, 12), [float][Math]::Max(1.2, $Size * 0.018))
    $penWhisker.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penWhisker.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    # Kumis Kiri
    $g.DrawLine($penWhisker, [float]($cx - $w * 0.42), [float]($cy + $h * 0.02), [float]($cx - $w * 0.20), [float]($cy + $h * 0.04))
    $g.DrawLine($penWhisker, [float]($cx - $w * 0.40), [float]($cy + $h * 0.12), [float]($cx - $w * 0.20), [float]($cy + $h * 0.10))
    # Kumis Kanan
    $g.DrawLine($penWhisker, [float]($cx + $w * 0.42), [float]($cy + $h * 0.02), [float]($cx + $w * 0.20), [float]($cy + $h * 0.04))
    $g.DrawLine($penWhisker, [float]($cx + $w * 0.40), [float]($cy + $h * 0.12), [float]($cx + $w * 0.20), [float]($cy + $h * 0.10))

    # 9. Kalung & Koin Perisai Emas Penjaga Dompet (Gold Shield Coin Collar)
    $coinW = $w * 0.22
    $coinH = $h * 0.24
    $coinTop = $cy + $h * 0.20
    $coinBot = $coinTop + $coinH

    $shieldPts = @(
        [System.Drawing.PointF]::new([float]$cx, [float]$coinTop),
        [System.Drawing.PointF]::new([float]($cx + $coinW * 0.48), [float]($coinTop + $coinH * 0.22)),
        [System.Drawing.PointF]::new([float]($cx + $coinW * 0.38), [float]($coinTop + $coinH * 0.72)),
        [System.Drawing.PointF]::new([float]$cx, [float]$coinBot),
        [System.Drawing.PointF]::new([float]($cx - $coinW * 0.38), [float]($coinTop + $coinH * 0.72)),
        [System.Drawing.PointF]::new([float]($cx - $coinW * 0.48), [float]($coinTop + $coinH * 0.22))
    )
    $brushGold = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 245, 158, 11))
    $g.FillPolygon($brushGold, $shieldPts)

    $penCoinBorder = New-Object System.Drawing.Pen([System.Drawing.Color]::White, [float][Math]::Max(1.5, $Size * 0.02))
    $penCoinBorder.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
    $g.DrawPolygon($penCoinBorder, $shieldPts)

    # Inti Emerald Hijau di Koin
    $gemR = [Math]::Max(2, $coinW * 0.16)
    $brushGem = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
    $g.FillEllipse($brushGem, [float]($cx - $gemR), [float]($coinTop + $coinH * 0.40 - $gemR), [float]($gemR * 2), [float]($gemR * 2))

    $targetDir = [System.IO.Path]::GetDirectoryName($OutFile)
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $bmp.Save($OutFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

# 6. Fungsi Render Layar Pembuka Piko (Splash Screen HD Warm Light)
function New-ZeroBuySplash {
    param(
        [int]$Width,
        [int]$Height,
        [string]$OutFile
    )

    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

    # Warm Cream Background Sesuai Tema Default Piko
    $brushBg = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 250, 248, 245))
    $g.FillRectangle($brushBg, 0, 0, $Width, $Height)

    # Titik tengah
    $cx = $Width / 2.0
    $cy = $Height / 2.0

    # Gambar Ikon Piko di Pusat Layar
    $iconSize = [int]([Math]::Min($Width, $Height) * 0.38)
    $tempIcon = Join-Path $env:TEMP "temp_zb_piko_icon.png"
    New-ZeroBuyIcon -Size $iconSize -OutFile $tempIcon -IsRound $true -IsForeground $false

    $iconBmp = [System.Drawing.Image]::FromFile($tempIcon)
    $g.DrawImage($iconBmp, [float]($cx - $iconSize / 2), [float]($cy - $iconSize / 2 - 40), [float]$iconSize, [float]$iconSize)
    $iconBmp.Dispose()
    Remove-Item $tempIcon -Force -ErrorAction SilentlyContinue

    # Teks Judul "Zero Buy"
    $fontTitle = New-Object System.Drawing.Font("Arial", [float]([Math]::Min($Width, $Height) * 0.065), [System.Drawing.FontStyle]::Bold)
    $brushTitle = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 255, 122, 0))
    $strFormat = New-Object System.Drawing.StringFormat
    $strFormat.Alignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString("Zero Buy", $fontTitle, $brushTitle, [float]$cx, [float]($cy + $iconSize / 2 - 10), $strFormat)

    # Subtitle "Point.Zero Commercial Edition"
    $fontSub = New-Object System.Drawing.Font("Arial", [float]([Math]::Min($Width, $Height) * 0.026), [System.Drawing.FontStyle]::Regular)
    $brushSub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
    $g.DrawString("Piko si Kucing Penjaga Dompet • Point.Zero", $fontSub, $brushSub, [float]$cx, [float]($cy + $iconSize / 2 + 50), $strFormat)

    $targetDir = [System.IO.Path]::GetDirectoryName($OutFile)
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $bmp.Save($OutFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

# 7. Eksekusi Pembuatan Ikon Mipmap Android
$densities = @(
    @{ Folder = "mipmap-mdpi"; Size = 48; ForeSize = 108 },
    @{ Folder = "mipmap-hdpi"; Size = 72; ForeSize = 162 },
    @{ Folder = "mipmap-xhdpi"; Size = 96; ForeSize = 216 },
    @{ Folder = "mipmap-xxhdpi"; Size = 144; ForeSize = 324 },
    @{ Folder = "mipmap-xxxhdpi"; Size = 192; ForeSize = 432 }
)

foreach ($d in $densities) {
    $dir = Join-Path $androidRes $d.Folder
    $icSquare = Join-Path $dir "ic_launcher.png"
    $icRound = Join-Path $dir "ic_launcher_round.png"
    $icFore = Join-Path $dir "ic_launcher_foreground.png"

    # Ikon Persegi & Bundar (Legacy Android)
    New-ZeroBuyIcon -Size $d.Size -OutFile $icSquare -IsRound $false -IsForeground $false
    New-ZeroBuyIcon -Size $d.Size -OutFile $icRound -IsRound $true -IsForeground $false

    # Ikon Depan Transparan (Adaptive Icon Android 8.0+)
    New-ZeroBuyIcon -Size $d.ForeSize -OutFile $icFore -IsRound $false -IsForeground $true

    Write-Host "  [OK] $($d.Folder) (Icon: $($d.Size)x$($d.Size), Foreground: $($d.ForeSize)x$($d.ForeSize))"
}

# 8. Eksekusi Pembuatan Splash Screen Full HD
$drawableDir = Join-Path $androidRes "drawable"
$drawableLandDir = Join-Path $androidRes "drawable-land"

New-ZeroBuySplash -Width 1080 -Height 1920 -OutFile (Join-Path $drawableDir "splash.png")
New-ZeroBuySplash -Width 1920 -Height 1080 -OutFile (Join-Path $drawableLandDir "splash.png")

Write-Host "  [OK] Splash screen portrait & landscape Piko berhasil diperbarui."
Write-Host "[ICONS] Seluruh aset ikon native & splash Piko berhasil disinkronkan!"
