# 🚀 Quick Commands Cheat Sheet

## 🔐 GitHub Secrets Setup

### Windows
```powershell
pwsh scripts/setup-github-secrets.ps1
```

### Linux/Mac
```bash
bash scripts/setup-github-secrets.sh
```

---

## 🛠️ Development

```bash
npm start                    # Dev server (localhost:3000)
npm run type-check          # TypeScript validation (REQUIRED before commits)
npm run build               # Production build
```

---

## 🔥 Firebase

```bash
npm run emulate             # Start local emulators
npm run deploy              # Full deploy (hosting + functions)
npx firebase-tools deploy --only firestore:rules   # Deploy rules only
```

---

## 🧹 Cleanup

```bash
npm run clean:3000          # Kill port 3000
npm run clean:all           # Full cleanup + reinstall
```

---

## 🐛 Fix Common Issues

### Port 3000 stuck
```bash
npm run clean:3000
```

### TypeScript errors
```bash
npm run type-check
```

### Firebase permissions errors
```bash
# Check firestore.rules was deployed
npx firebase-tools deploy --only firestore:rules
```

### GitHub Actions failing
```bash
# Setup secrets automatically
pwsh scripts/setup-github-secrets.ps1
```

---

## 🚀 Deployment

### Trigger Manual Deploy
```bash
git commit --allow-empty -m "chore: trigger deployment"
git push
```

### Check Deploy Status
```
https://github.com/hamdanialaa3/New-Globul-Cars/actions
```

---

## 📊 Project Stats

- **795 Components**
- **780+ TypeScript Files**
- **410+ Services**
- **195,000+ Lines of Code**
- **6 Collections** (passenger_cars, suvs, vans, motorcycles, trucks, buses)

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Firebase Console** | https://console.firebase.google.com/project/fire-new-globul |
| **GitHub Actions** | https://github.com/hamdanialaa3/New-Globul-Cars/actions |
| **Repository Secrets** | https://github.com/hamdanialaa3/New-Globul-Cars/settings/secrets/actions |
| **Production Site** | https://mobilebg.eu |
| **Firebase Hosting** | https://fire-new-globul.web.app |

---

**Keep this handy!** 📌
