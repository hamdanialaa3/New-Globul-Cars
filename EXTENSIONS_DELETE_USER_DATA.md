# Delete User Data Extension - Install Guide

This project uses the firebase/delete-user-data extension to automatically delete a user's data (Firestore and Storage) when they delete their Firebase Auth account.

Requirements
- Firebase CLI signed in to the correct project (fire-new-globul)
- Project Owner/Editor permissions

Parameters to use
- LOCATION: europe-west3
- FIRESTORE_DATABASE_ID: (default)
- FIRESTORE_PATHS: users/{UID},admins/{UID}
- FIRESTORE_DELETE_MODE: ShALLOW
- RTDB_INSTANCE: (leave empty)
- RTDB_LOCATION: (leave empty)
- RTDB_PATHS: (leave empty)
- STORAGE_BUCKET: fire-new-globul.appspot.com
- STORAGE_PATHS: {DEFAULT}/{UID}-pic.png,my-awesome-app-logs/{UID}-logs.txt
- ENABLE_AUTO_DISCOVERY: false
- AUTO_DISCOVERY_SEARCH_DEPTH: 3
- AUTO_DISCOVERY_SEARCH_FIELDS: id,uid,userId
- SEARCH_FUNCTION_URL: (leave empty)
- ENABLE_EVENTS: false

Install steps (interactive)
1. Open a terminal in the repo root
2. Run the installer interactively:
   - Optional to run:
   ```powershell
   firebase ext:install firebase/delete-user-data --project fire-new-globul --force
   ```
3. When prompted, enter the parameters exactly as listed above.
4. Wait for deployment to complete.

Verification
- In Firebase Console > Extensions, ensure Delete User Data is installed in europe-west3
- Delete a test user account from Firebase Auth
- Confirm Firestore documents under users/{uid}, admins/{uid} are deleted
- Confirm Storage objects under the given paths are deleted

Notes
- If you have subcollections to delete, change mode to DOCUMENTS_AND_SUBCOLLECTIONS or add explicit paths.
- Deleting an Auth user from the frontend now triggers this extension automatically.
