This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions till "Creating a new application" step, before proceeding.

## Release

- Privacy policy URL
  https://www.iubenda.com/privacy-policy/23297359

### iOS

Simulator v. for 6.7" screen = iPhone 15 Pro Max
Simulator v. for 5.5" screen = iPhone SE (3rd generation)

### Android

Version is changed at: `android/app/build.gradle`
Built bundle is stored here: android/app/build/outputs/bundle/release
Built .apk is stored here: android/app/build/outputs/apk/release

To get SHA-1 key
a) cd android && ./gradlew signingReport
b) keytool -list -v -keystore ./android/App/debug.keystore -alias androiddebugkey -storepass android -keypass android
c) keytool -list -v \
-alias my-key-alias -keystore /Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home/my-upload-key.keystore

To get info: cd android && ./gradlew bootstrapListing

## Development

### Modifying your App

Now that you have successfully run the app, let's modify it.

1. Open `App.tsx` in your text editor of choice and edit some lines.
2. For **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Developer Menu** (<kbd>Ctrl</kbd> + <kbd>M</kbd> (on Window and Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (on macOS)) to see your changes!

   For **iOS**: Hit <kbd>Cmd ⌘</kbd> + <kbd>R</kbd> in your iOS Simulator to reload the app and see your changes!

### Google Cloud

- `yarn functions` to start firebase functions

## Setup

```bash
gem install bundler -v 2.4.22
bundle install
cd ios
pod install
```

### Error handling

1. Related to 'duplicate symbols for architecture x86_64'

   - Find the related pod file from the logs
   - Go to Pods. Find the specific pod under 'targets'.
   - Go to 'Build Phases' > 'Compile Sources'
   - Remove the source which has duplicate somewhere else
   - yarn patch is used for fixing one of these errors

### Resolutions

- `valtio` is needed to fix a conflict between @web3modal/react-native and @web3modal/react

### Step 1: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
# using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Start your Application

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

#### For Android

```bash
# using npm
npm run android

# OR using Yarn
yarn android
```

#### For iOS

```bash
# using npm
npm run ios

# OR using Yarn
yarn ios
```
