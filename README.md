# Memorii Sync

Yet another simple and intuitive flashcard app to boost your memory. Memorii Sync is designed to be an easy-to-use flashcard application aimed at enhancing memory retention and facilitating efficient learning

## Features
- Offline syncing capabilities 
- In-app store with premade decks
- Partial spaced repetition algorithm
- Intuitive customizable deck creation


## Development

### Prerequisites

- node v16.x.x
- `src/config/conf.ts` file needs to be updated with user's config
- `google-services.json` needs to be put in the root directory
- Firebase project
- Expo cli with an account logged in (https://docs.expo.dev/get-started/installation/)

### Installation

```bash
npx expo install # install dependencies
npx expo prebuild --clean # cleans and generate the android dir
npx expo run:android # run the app in an emulator
```

#### Building the apk:

```bash
npm install -g eas-cli
eas build -p android --profile preview
```

#### Generating SHA-1
The SHA-1 needs to be placed both in the expo project and the firebase project
```bash
cd android
./gradlew signingReport
```

#### Important eas commands
```bash
eas whoami
eas configure

eas init --id <eas-project-id> # resets the id

```

### Docs

#### Build Profile

A build profile is a named group of configurations that describes the necessary parameters to perform a certain type of build.

The JSON object under the `build` key can contain multiple build profiles, and you can name these build profiles whatever you like, F,ex: `development`, `preview`, and `production`

To run a build with a specific profile, execute `eas build --profile <profile-name>`. If you omit the `--profile` flag, EAS CLI will default to using the profile with the name **production**, if it exists.

Build profiles can extend another build profile using the extends key. For example, in the preview profile you may have "extends": "production". This will make the preview profile inherit the configuration of the production profile.

<b>More: </b> https://docs.expo.dev/build/eas-json/#development-builds

#### Automatic build versioning
One of the most frequent causes of app store rejections is submitting a build with a duplicate version number. This happens when a developer forgets to increment the version number before running a build.

EAS Build can manage automatically incrementing these versions for you if you opt into using the "remote" app version source. The default behavior is to use a "local" app version source, which means you control versions manually in their respective config files.

```json
{
  "cli": {
    "appVersionSource": "remote"
  },
  "build": {
    "staging": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

#### Firestore rules

```bash
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Public access to appInfo and market
    match /appInfo/{document=**} {
      allow read;
    }
    match /market/{document=**} {
      allow read;
    }

    // Access restrictions for users
    match /users/{userId} {
      // Allow only the current user to access their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Access control for decks
    match /decks/{deckId} {
      // Allow users to read decks only if they have purchased them
			allow read: if request.auth.uid != null 
                  && exists(/databases/$(database)/documents/users/$(request.auth.uid))
                  && deckId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.decksPurchased;
    }
  }
}

```

### Issues faced

- View is not a jsx component: https://github.com/eslint/eslint/issues/15802
