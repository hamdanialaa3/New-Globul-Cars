# AI Context Guide — How to Keep AI Assistants Informed

> This guide explains the knowledge base system that enables any AI model to fully understand the Koli One project in seconds.

---

## The Knowledge Base System

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AI Model Reads                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. CODEBASE.md (single source of truth)                │
│     └── Complete: services, hooks, pages, workflows,    │
│         rules, integrations, data model, Cloud Functions │
│                                                         │
│  2. .cursorrules / .github/copilot-instructions.md      │
│     └── Quick rules + pointer to CODEBASE.md            │
│                                                         │
│  3. /memories/repo/ (Copilot persistent memory)         │
│     ├── architecture.md    — Tech stack + critical rules │
│     ├── services-map.md    — All 140+ services catalog   │
│     └── key-workflows.md   — Core business flows         │
│                                                         │
│  4. CONSTITUTION.md (governance enforcement)            │
│     └── 18 articles of architecture law                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Which File Does What?

| File | Purpose | When to Read |
|------|---------|-------------|
| `CODEBASE.md` | **Complete project knowledge** — every service, hook, page, rule, workflow | First thing any AI should read |
| `CONSTITUTION.md` | Governance rules (18 articles) with detailed code patterns | When implementing architecture-level changes |
| `.cursorrules` | Quick AI rules for Cursor IDE | Auto-loaded by Cursor |
| `.github/copilot-instructions.md` | Quick AI rules for GitHub Copilot | Auto-loaded by Copilot |
| `/memories/repo/*.md` | Persistent Copilot memory (auto-loaded each session) | Auto-loaded by Copilot |

### For Different AI Models

| AI Model | What It Reads Automatically | What to Paste Manually |
|----------|---------------------------|----------------------|
| **GitHub Copilot** | `.github/copilot-instructions.md` + `/memories/repo/` | Nothing — reads `CODEBASE.md` via instruction reference |
| **Cursor** | `.cursorrules` | Nothing — reads `CODEBASE.md` via reference |
| **ChatGPT / Claude / Other** | Nothing automatic | Paste contents of `CODEBASE.md` into the conversation |

---

## How to Keep CODEBASE.md Updated

### When to Update

Update `CODEBASE.md` when:
- Adding a **new service** → Add to §5 (Services Catalog)
- Adding a **new hook** → Add to §6 (Hooks Catalog)
- Adding a **new page** → Add to §7 (Pages Map)
- Adding a **new Cloud Function** → Add to §9 (Cloud Functions)
- Adding a **new integration** → Add to §11 (Integrations)
- Adding a **new context provider** → Add to §8 (Contexts)
- Changing **architecture rules** → Update §3 (Non-Negotiable Rules)
- Changing **data model** → Update §4 (Data Architecture)
- Adding a **new business workflow** → Add to §14 (Workflows)

### How to Update

1. Open `CODEBASE.md`
2. Find the relevant section (§1-§17)
3. Add a single row to the appropriate table with: `| name | one-line purpose |`
4. Update the "Last updated" date at the bottom
5. If the change is significant, also update the corresponding `/memories/repo/*.md` file

### Template for Adding a New Service

```markdown
| `my-new-service.ts` | One-line description of what this service does |
```

### Template for Adding a New Hook

```markdown
| `useMyNewHook` | One-line description of what this hook does |
```

---

## Verification Checklist

After updating `CODEBASE.md`, verify:

- [ ] Section numbers (§) still match headers
- [ ] No duplicate entries in tables
- [ ] File paths are correct and exist
- [ ] "Last updated" date is current
- [ ] Markdown renders correctly (preview in VS Code)

---

## FAQ

**Q: Why one big file instead of many small files?**
A: AI models have context windows. One structured file is faster to load (one read) and gives complete context. Multiple files require multiple reads and risk partial understanding.

**Q: What if CODEBASE.md gets too long?**
A: At ~800-1000 lines, it's well within AI context limits. The table-based format keeps it scannable. If it exceeds 2000 lines, consider splitting §5 (Services) into a separate `SERVICES_CATALOG.md` and linking from CODEBASE.md.

**Q: Should I update /memories/repo/ too?**
A: For major changes (new domains, rule changes), yes. For individual service additions, `CODEBASE.md` alone is sufficient since Copilot's instructions point to it.

**Q: What about the existing docs/ and documents/ folders?**
A: They remain as detailed implementation guides. `CODEBASE.md` is the overview; `docs/` provides deep dives. They complement each other.
