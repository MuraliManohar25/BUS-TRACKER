# Deploy Firestore Rules - Workaround

## Option 1: Use Command Prompt (CMD) instead of PowerShell

1. Open **Command Prompt** (not PowerShell)
   - Press `Win + R`
   - Type `cmd` and press Enter

2. Navigate to project:
   ```cmd
   cd "C:\Users\MURALI MANOHAR\Desktop\BUS TRACKER"
   ```

3. Deploy rules:
   ```cmd
   npx firebase-tools deploy --only firestore:rules
   ```

## Option 2: Change PowerShell Execution Policy (Temporary)

Run this in PowerShell as Administrator:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process
```

Then try again:
```powershell
npm run deploy:firestore
```

## Option 3: Deploy Rules via Firebase Console (Manual)

1. Go to: https://console.firebase.google.com/project/bus-tracker-266d9/firestore/rules

2. Copy the contents of `firestore.rules` file

3. Paste into the Firebase Console rules editor

4. Click "Publish"

## Option 4: Use Firebase CLI Directly

If Firebase CLI is installed globally:

```powershell
firebase deploy --only firestore:rules
```

## Quick Test Without Deploying Rules

You can test the app now! The rules will use default settings until deployed.

1. Open: http://localhost:3000
2. Try the app features
3. Check browser console (F12) for any permission errors

If you see permission errors, deploy the rules using one of the methods above.

