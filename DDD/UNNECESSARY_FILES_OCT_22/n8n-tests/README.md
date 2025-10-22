# Globul Cars - n8n Cloud Webhooks Test

## 🚀 Automated Testing (Recommended)

Test all 21 endpoints with a single command!

### Node.js Script
```bash
node test-all-webhooks.js
```

### Python Script
```bash
python test-all-webhooks.py
```

**Features:**
- ✅ Tests all 21 webhook endpoints automatically
- ✅ Color-coded output (success/failure)
- ✅ Detailed summary report
- ✅ Auto-generated unique IDs and timestamps
- ✅ 500ms delay between requests
- ✅ Grouped by workflow

**Output Example:**
```
▶ Testing Complete Sell
✓ [Complete Sell] /seller-type-selected → 200
✓ [Complete Sell] /vehicle-data-entered → 200
...
Test Summary
Total Tests: 21
Successful: 21
Success Rate: 100.0%
```

---

## Quick Start (Postman)

1. Import `GlobulCars-n8n.postman_collection.json` into Postman.
2. Create a Postman Environment and add:
   - `baseUrl` = `https://globul-cars-bg.app.n8n.cloud/webhook`
   - `now` = `{{timestamp}}` (or any ISO string)
3. Open a request and hit Send. Check n8n Executions for results.

## Endpoints Covered
- Workflow 3: seller-type-selected, vehicle-data-entered
- Workflow 4: user-registered, listing-created
- Workflow 5: car-viewed, message-sent
- Workflow 6: admin-login, system-alert

## Notes
- Requests are POST with JSON bodies.
- Adjust payload fields to match your data.
- If a URL returns 404, make sure the workflow is Active and you used the correct path.

## Quick Start (Apidog)

If you use Apidog instead of Postman:

1. Create or import a project
   - Click "Create blank project" (or "Import Postman collection" and select `GlobulCars-n8n.postman_collection.json`).
2. Set an environment variable
   - In Apidog, open Environments (top-right), add a new environment with variable:
     - `baseUrl` = `https://globul-cars-bg.app.n8n.cloud/webhook`
3. Create a new request
   - Method: `POST`
   - URL: `{{baseUrl}}/admin-login`
   - Body: JSON, raw
     {
       "action": "admin_login",
       "adminId": "admin-1",
       "data": { "isNewLocation": false },
       "timestamp": "2025-10-16T10:00:00Z"
     }
4. Send the request and check n8n Executions
   - In n8n Cloud → Executions, verify a new run appears.

Tips:
- Use the same pattern for other endpoints, e.g. `{{baseUrl}}/system-alert`, `{{baseUrl}}/car-viewed`.
- If you see a GET-only error, switch the method to POST.

## Troubleshooting 404 (Oops, couldn’t find that)

If you get a 404 from n8n:

1. URL correctness
   - Use the Cloud URL: `https://globul-cars-bg.app.n8n.cloud/webhook/<path>`
   - Do NOT use localhost:5678 unless you run a local n8n.
2. HTTP method
   - Most webhooks are POST-only. Ensure method = POST.
3. Workflow is Active
   - In n8n Cloud, open the workflow and ensure the Active toggle is ON (green).
4. Path spelling
   - Match the exact path from the workflow node (e.g., `admin-login`, `system-alert`).
5. Authentication/Firewall
   - Ensure your network allows outbound HTTPS and no VPN/proxy is blocking the request.
6. Quick browser check
   - Visiting the URL via browser will show a 404 for GET (expected). Sending POST should work from Apidog/Postman.

If these checks don’t resolve it, copy the full URL and the payload you sent and share the exact response body to debug further.
