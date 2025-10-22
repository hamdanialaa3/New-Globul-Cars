# القسم 8: إدارة الفريق (Team Management)

## 8.1 الأدوار (Roles)

```
Owner:
  Permissions:
    • Full access to everything
    • Billing & payments
    • Team management
    • Settings & integrations
    • Delete company account
  
  Cannot be removed
  Can transfer ownership

Manager:
  Permissions:
    • View all listings
    • Edit all listings
    • Add new listings
    • Delete listings
    • View analytics
    • Manage messages
    • Team activity view
  
  Cannot:
    • Change billing
    • Add/remove team members
    • Change company settings

Editor:
  Permissions:
    • Add new listings
    • Edit own listings
    • Upload photos
    • Respond to messages
    • View basic stats
  
  Cannot:
    • Delete listings
    • View billing
    • Access full analytics

Viewer:
  Permissions:
    • View all listings (read-only)
    • View analytics (read-only)
    • Export reports
  
  Cannot:
    • Edit anything
    • Send messages
    • Add listings
```

## 8.2 Team Management UI

```
┌─────────────────────────────────────────────────────────────┐
│ Team Management                              [Add Member +] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Active Members (12/15):                                     │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ [User] Ivan Petrov (Owner)                         │   │
│ │      ivan@company.com | Sofia Office                │   │
│ │      Active: Today 2:34 PM                          │   │
│ │      [View Activity]                                │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─────────────────────────────────────────────────────┐   │
│ │ [User] Maria Dimitrova (Manager)                    │   │
│ │      maria@company.com | Plovdiv Office             │   │
│ │      Last Active: Today 10:15 AM                    │   │
│ │      [Edit Role ▼] [Remove] [View Activity]        │   │
│ └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ... (10 more members)                                       │
│                                                             │
│ Activity Log:                                               │
│ • Ivan added "BMW 320d" - 10 min ago                       │
│ • Maria edited "Audi A4" pricing - 2h ago                  │
│ • Georgi responded to 3 inquiries - 4h ago                 │
│                                                             │
│ [Team Performance] [Export Activity] [Settings]           │
└─────────────────────────────────────────────────────────────┘
```
