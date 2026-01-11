# ⚡ Quick Start: Google Cloud Setup (2 Minutes)

**Last Updated:** January 11, 2026

---

## 🎯 What You Need

1. Access to Google Cloud Console
2. GitHub CLI installed + authenticated
3. 2 minutes of your time

---

## 🚀 Step 1: Google Cloud Shell (1 minute)

### Open Cloud Shell:
```
https://console.cloud.google.com/
```

### Copy → Paste → Run:
```bash
curl -sL https://raw.githubusercontent.com/hamdanialaa3/New-Globul-Cars/main/scripts/google-cloud-setup.sh | bash
```

### Copy the output:
- The script displays JSON content
- Copy from `{` to `}`
- **Keep it ready for Step 2**

---

## 💻 Step 2: Your Local Machine (1 minute)

### Open PowerShell in project folder:
```powershell
cd path\to\New-Globul-Cars
pwsh scripts/setup-firebase-secrets.ps1
```

### Follow prompts:
1. Paste the JSON you copied
2. Press Enter twice
3. Type `y` to confirm
4. Type `y` to re-run workflow
5. Type `y` to delete key.json

---

## ✅ Step 3: Verify (10 seconds)

### Check workflow:
```
https://github.com/hamdanialaa3/New-Globul-Cars/actions
```

Should see: ✅ Workflow succeeded

---

## 🐛 If Something Goes Wrong

### "GitHub CLI not found"
```powershell
winget install GitHub.cli
gh auth login
```

### "Script not found"
Make sure you're in the project root folder.

### "Workflow still failing"
Check secrets are named correctly:
```
https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions
```

Must see:
- `FIREBASE_SERVICE_ACCOUNT` ✅
- `FIREBASE_PROJECT_ID` ✅

---

## 📖 Need More Details?

See: [docs/GOOGLE_CLOUD_SETUP_GUIDE.md](docs/GOOGLE_CLOUD_SETUP_GUIDE.md)

---

**That's it! 🎉**