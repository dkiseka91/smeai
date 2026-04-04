# AElevate — Deployment Guide

## 1. Firebase Project Setup

```bash
# Login to Firebase CLI
firebase login

# Create the project (or use existing)
firebase projects:create aelevate-hub

# Link this repo to the project
cp .firebaserc.example .firebaserc
# Edit .firebaserc and set your project ID
```

## 2. Environment Variables

```bash
cp .env.example .env
# Fill in all VITE_FIREBASE_* values from Firebase Console > Project Settings
# Add your admin email(s):
# VITE_ADMIN_EMAILS=your@email.com,other@email.com
# Add the Functions base URL after deploying functions:
# VITE_FUNCTIONS_BASE_URL=https://us-central1-YOUR_PROJECT.cloudfunctions.net
```

## 3. Set Pesapal Secrets (Cloud Functions config)

```bash
firebase functions:config:set \
  pesapal.consumer_key="YMEs7enmNYa5JxuGgRX+eBHUzWeH3XTw" \
  pesapal.consumer_secret="qWCyRuodTG7NT7Azj08NjCO7k9I="
```

## 4. Enable Firebase Services

In the Firebase Console:
- Authentication > Sign-in method > Enable **Email/Password**
- Firestore Database > Create database (start in production mode)
- Storage > Get started

## 5. Install & Build

```bash
npm install
npm run build

cd functions
npm install
npm run build
cd ..
```

## 6. Deploy Everything

```bash
# Deploy Firestore rules + indexes
firebase deploy --only firestore

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy hosting
firebase deploy --only hosting
```

Or deploy all at once:
```bash
firebase deploy
```

## 7. Seed Initial Data

1. Open the live site and log in with your admin email
2. Navigate to `/admin`
3. Click **Seed Database** to populate Firestore with starter content
4. Then edit each item via the Admin Panel content managers

## 8. Post-Launch Checklist

- [ ] Verify Pesapal IPN URL is reachable (Functions URL)
- [ ] Test a sandbox payment end-to-end
- [ ] Switch `PESAPAL_BASE` in `functions/src/index.ts` from sandbox to production URL
- [ ] Set a custom domain in Firebase Hosting
- [ ] Enable Firebase App Check (anti-abuse)
