const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const wwwDir = path.join(__dirname, 'www');
const androidAssetsDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public');

console.log('====================================================');
console.log('   Z.E.R.O. BUNDLER — ZERO BUY.APK (v4.0.0 Point.Zero Commercial Edition)');
console.log('====================================================');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// 1. Bersihkan folder www
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}
fs.mkdirSync(wwwDir, { recursive: true });

// 2. Salin src ke www
console.log('[1/2] Menyalin berkas dari src/ -> www/...');
copyRecursiveSync(srcDir, wwwDir);
console.log('      [OK] www/ berhasil diperbarui.');

// 3. Salin ke android assets jika folder android ada
if (fs.existsSync(path.join(__dirname, 'android'))) {
  console.log('[2/2] Menyalin berkas dari www/ -> android assets...');
  copyRecursiveSync(wwwDir, androidAssetsDir);
  console.log('      [OK] Android public assets tersinkronisasi.');
} else {
  console.log('[2/2] Folder android belum dibuat. Lewati penyalinan native.');
}

console.log('====================================================');
console.log('   PROSES BUNDLING WWW SELESAI DENGAN SUKSES!');
console.log('====================================================\n');
