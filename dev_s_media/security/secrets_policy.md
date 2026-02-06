# 🔐 Secrets Management Policy

## 🚫 forbidden Practices
- **NEVER** commit `.env` files to Git.
- **NEVER** hardcode tokens in source code.
- **NEVER** share keys via Slack/Email/WhatsApp.

## ✅ Approved Storage
### 1. Development (Local)
- Use a local `.env` file (ensure it is in `.gitignore`).
- For sensitive keys, use a local password manager (1Password/Bitwarden) to inject env vars.

### 2. Staging & Production
- **Google Secret Manager** (Preferred) OR **GitHub App Secrets**.
- Secrets are injected into the container/process at **runtime only**.

## 🔄 Rotation Policy
| Secret Name | Rotation Frequency | Method |
| :--- | :--- | :--- |
| `PAGE_ACCESS_TOKEN` | Every 60 Days | Automated Script (`scripts/rotate_secrets.sh`) |
| `IG_USER_TOKEN` | Every 60 Days | Manual Renewal via Dashboard |
| `DB_PASSWORD` | Every 90 Days | Infrastructure Team |

## 🚨 Incident Response (Leaked Key)
1. **Revoke immediately** via Developer Portal.
2. **Rotate** all dependent services.
3. **Audit** logs for unauthorized usage during the leak window.
4. **Report** incident in `docs/incidents/`.
