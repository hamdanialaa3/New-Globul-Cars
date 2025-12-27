
# DeepSeek AI Integration Guide

## 1. Editor Integration (VS Code / Cursor / Continue)

To use DeepSeek directly within your editor as a coding assistant, you need to configure your AI extension.

### For "Continue" Extension (Recommended)
Add this to your `~/.continue/config.json` or `.vscode/continue-config.json` (if supported):

```json
{
  "models": [
    {
      "title": "DeepSeek Chat",
      "provider": "openai",
      "model": "deepseek-chat",
      "apiBase": "https://api.deepseek.com",
      "apiKey": "sk-f301f893f4664c39aa2cf2951f8bea8c"
    },
    {
      "title": "DeepSeek Coder",
      "provider": "openai",
      "model": "deepseek-coder",
      "apiBase": "https://api.deepseek.com",
      "apiKey": "sk-f301f893f4664c39aa2cf2951f8bea8c"
    }
  ],
  "tabAutocompleteModel": {
    "title": "DeepSeek Coder",
    "provider": "openai",
    "model": "deepseek-coder",
    "apiBase": "https://api.deepseek.com",
    "apiKey": "sk-f301f893f4664c39aa2cf2951f8bea8c"
  }
}
```

### For "Cursor" Editor
1. Go to **Cursor Settings** (Gear Icon) > **Models**.
2. Add a new OPENAI-compatible model.
3. Base URL: `https://api.deepseek.com`
4. API Key: `sk-f301f893f4664c39aa2cf2951f8bea8c`
5. Model Names: `deepseek-chat`, `deepseek-coder`

---

## 2. Application Integration (For Users)

The API Key has been added to your project configuration.

- **Environment File**: `.env.local` now contains `REACT_APP_DEEPSEEK_API_KEY`.
- **Service Wrapper**: A new helper service has been created at `src/services/DeepSeekService.ts`.

### How to use in code:

```typescript
import { DeepSeekService } from './services/DeepSeekService';

// Example: Ask a question
async function getAIHelp() {
  try {
    const answer = await DeepSeekService.ask("How do I fix a flat tire?");
    console.log(answer);
  } catch (error) {
    console.error("AI Error:", error);
  }
}
```
