---
title: Understanding Firebase
published: false
description: Set up, the emulators, local/dev vs production
tags:
//cover_image: https://direct_url_to_image.jpg
---

# Firebase Resources Used

1. Firestore (noSQL datebase)
2. Firebase Hosting
3. Firebase Cloud Functions
4. Firebase Authorization
5. Firebase Emulators

[Create a Firebase project in the Firebase console](https://firebase.google.com/docs/web/setup)
[A Firebase project is a GCP project that has additional Firebase-specific configurations and services.](https://firebase.google.com/docs/projects/learn-more#firebase-cloud-relationship).

Firestore Indexes: "Firestore indexes allow you to perform complex queries while
maintaining performance that scales with the size of the result
set. You can keep index definitions in your project directory
and publish them with firebase deploy."

```
~/Development/understanding-firebase(master*) » firebase init

     ######## #### ########  ######## ########     ###     ######  ########
     ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
     ######    ##  ########  ######   ########  #########  ######  ######
     ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
     ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

  /Users/ForeignFood/Development/understanding-firebase

? Which Firebase CLI features do you want to set up for this folder? Press Space to select features, then Enter to confirm your choices.
Firestore: Deploy rules and create indexes for Firestore,
Functions: Configure and deploy Cloud Functions,
Hosting: Configure and deploy Firebase Hosting sites,
Emulators: Set up local emulators for Firebase features

=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add,
but for now we'll just set up a default project.

? Please select an option: Use an existing project
? Select a default Firebase project for this directory: testapp-a7495 (TestApp)
i  Using project testapp-a7495 (TestApp)

=== Firestore Setup

Firestore Security Rules allow you to define how and when to allow
requests. You can keep these rules in your project directory
and publish them with firebase deploy.

? What file should be used for Firestore Rules? firestore.rules
? File firestore.rules already exists. Do you want to overwrite it with the Firestore Rules from the Firebase Console? Yes

Firestore indexes allow you to perform complex queries while
maintaining performance that scales with the size of the result
set. You can keep index definitions in your project directory
and publish them with firebase deploy.

? What file should be used for Firestore indexes? firestore.indexes.json

=== Functions Setup

A functions directory will be created in your project with a Node.js
package pre-configured. Functions can be deployed with firebase deploy.

? What language would you like to use to write Cloud Functions? TypeScript
? Do you want to use TSLint to catch probable bugs and enforce style? Yes
✔  Wrote functions/package.json
✔  Wrote functions/tslint.json
✔  Wrote functions/tsconfig.json
✔  Wrote functions/src/index.ts
✔  Wrote functions/.gitignore
? Do you want to install dependencies with npm now? Yes

> protobufjs@6.9.0 postinstall /Users/ForeignFood/Development/understanding-firebase/functions/node_modules/protobufjs
> node scripts/postinstall

npm notice created a lockfile as package-lock.json. You should commit this file.
added 286 packages from 221 contributors and audited 286 packages in 127.446s

30 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities


=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

? What do you want to use as your public directory? public
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? File public/index.html already exists. Overwrite? Yes
✔  Wrote public/index.html

=== Emulators Setup
? Which Firebase emulators do you want to set up? Press Space to select emulators, then Enter to confirm your choices. Functions, Firestore, Hosting
? Which port do you want to use for the functions emulator? 5001
? Which port do you want to use for the firestore emulator? 8080
? Which port do you want to use for the hosting emulator? 5000
? Would you like to enable the Emulator UI? Yes
? Which port do you want to use for the Emulator UI (leave empty to use any available port)?
? Would you like to download the emulators now? Yes

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...
```

```
export GOOGLE_APPLICATION_CREDENTIALS="/Users/ForeignFood/.config/gcloud/TestApp-0c8c7854335c.json"
```
