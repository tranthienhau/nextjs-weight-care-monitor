# Capture flow

How the screenshots and demo GIFs in this repo are produced.

## Screenshots (phone + desktop)

```sh
npm install
npx playwright install chromium   # first time only
npm run build && npx next start -p 3100 &
BASE_URL=http://localhost:3100 node scripts/capture.mjs
```

`scripts/capture.mjs` opens the production build in headless Chromium, signs in as the demo
user for each screen (it writes the persisted demo session to `localStorage`), and saves:

- phone frames at 393x852 (2x) to `screenshots/01-...png` through `20-...png`
- desktop frames at 1440x900 to `screenshots/d1-...png` through `d4-...png`

## Demo GIFs (iOS Safari + Android Chrome)

Both GIFs show the deployed PWA, one codebase on both platforms.

iOS (Simulator, Safari):

```sh
xcrun simctl boot "iPhone 17 Pro"
xcrun simctl openurl booted "https://<deployment>/sign-in"
xcrun simctl io booted recordVideo --codec h264 ios.mp4   # Ctrl-C to stop
```

Android (Emulator, Chrome):

```sh
emulator -avd Medium_Phone_API_36.1 &
adb wait-for-device
adb shell am start -a android.intent.action.VIEW -d "https://<deployment>/sign-in" com.android.chrome
adb shell screenrecord --time-limit 27 --size 540x1200 /sdcard/ademo.mp4
adb pull /sdcard/ademo.mp4 android.mp4
```

Convert each recording to a compact GIF (12 fps, 300 px wide):

```sh
ffmpeg -y -i ios.mp4 -vf "fps=12,scale=300:-1:flags=lanczos,palettegen=stats_mode=diff" /tmp/pal.png
ffmpeg -y -i ios.mp4 -i /tmp/pal.png -lavfi "fps=12,scale=300:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" screenshots/demo.gif
```

Repeat with `android.mp4` to `screenshots/demo-android.gif`.
