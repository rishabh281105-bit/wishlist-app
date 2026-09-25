// Adds Wishlist's own pieces to the Android project that Capacitor generates.
const fs = require('fs');
const path = require('path');

const PKG = 'com.rishabh.wishlist';
const APP = 'android/app';
const MAIN = APP + '/src/main';
const version = process.env.APP_VERSION || '1.0.0';
const code = parseInt(process.env.APP_VERSION_CODE || '1', 10);

function edit(file, fn) {
  const before = fs.readFileSync(file, 'utf8');
  const after = fn(before);
  if (after === before) throw new Error('Nothing changed in ' + file + ' (the template may have changed).');
  fs.writeFileSync(file, after);
  console.log('patched', file);
}
function copyDir(src, dst) {
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name), d = path.join(dst, name);
    if (fs.statSync(s).isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyDir(s, d); }
    else fs.copyFileSync(s, d);
  }
}

// 1. Share receiver (Java)
const javaDir = path.join(MAIN, 'java', ...PKG.split('.'));
fs.mkdirSync(javaDir, { recursive: true });
for (const f of ['MainActivity.java', 'ShareInboxPlugin.java']) fs.copyFileSync(f, path.join(javaDir, f));
console.log('copied Java files');

// 2. Show "Wishlist" in the Share menu for text and links
edit(MAIN + '/AndroidManifest.xml', s => s.replace(
  /(<category android:name="android.intent.category.LAUNCHER" \/>\s*<\/intent-filter>)/,
  `$1

            <intent-filter android:label="Wishlist">
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>`));

// 3. Version number and permanent signing key, so updates install over the old app
edit(APP + '/build.gradle', s => s
  .replace(/versionCode \d+/, 'versionCode ' + code)
  .replace(/versionName "[^"]*"/, 'versionName "' + version + '"')
  .replace(/\n    buildTypes \{\n        release \{\n/, `
    signingConfigs {
        release {
            storeFile file('wishlist-release.p12')
            storePassword 'wishlist-keystore'
            keyAlias 'wishlist'
            keyPassword 'wishlist-keystore'
            storeType 'pkcs12'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
`));

// 4. Colours for the status bar, navigation bar and launch screen
edit(MAIN + '/res/values/styles.xml', s => s
  .replace('<item name="android:background">@null</item>\n    </style>',
    `<item name="android:background">@null</item>
        <item name="android:windowBackground">@color/wl_bg</item>
        <item name="android:statusBarColor">@color/wl_bg</item>
        <item name="android:navigationBarColor">@color/wl_bg</item>
        <item name="android:windowLightStatusBar">true</item>
        <item name="android:windowLightNavigationBar">true</item>
    </style>`)
  .replace('<item name="android:background">@drawable/splash</item>',
    `<item name="android:background">@drawable/splash</item>
        <item name="windowSplashScreenBackground">@color/wl_bg</item>`));
fs.writeFileSync(MAIN + '/res/values/wl_colors.xml',
  '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="wl_bg">#EEF1EF</color>\n</resources>\n');

// 5. App icon, and a plain launch screen in the app's background colour
const icons = require('./app-icons.js');
for (const rel of Object.keys(icons)) {
  const dest = path.join(MAIN, 'res', rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, Buffer.from(icons[rel], 'base64'));
}
for (const dir of fs.readdirSync(path.join(MAIN, 'res'))) {
  const png = path.join(MAIN, 'res', dir, 'splash.png');
  if (dir.startsWith('drawable') && fs.existsSync(png)) fs.unlinkSync(png);
}
fs.mkdirSync(path.join(MAIN, 'res', 'drawable'), { recursive: true });
fs.writeFileSync(path.join(MAIN, 'res', 'drawable', 'splash.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n<layer-list xmlns:android="http://schemas.android.com/apk/res/android">\n    <item android:drawable="@color/wl_bg" />\n</layer-list>\n');
console.log('added icons and launch screen');
console.log('Android project ready: version', version, 'code', code);
