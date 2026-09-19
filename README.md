# Rack Management System - Tag Management Frontend

React + Vite frontend for the Rack Management System.

## Included updates

- New Login page and Register page.
- Registration supports `USER` and `ADMIN` access types.
- Page-level access checkboxes are stored per user.
- Sidebar only shows pages the logged-in user can access.
- Direct route access is also protected.
- Reports page removed.
- Theme controls moved from the sidebar to the Settings page.
- Tag History page shows up to the top 100 matching records.
- Tag History filters: Tag ID, From Date, To Date, and Location.
- Assignment/update/remove operations are written into Tag History.

## Run

```bash
npm install
npm run dev
```

## Authentication note

This project is currently frontend-only, so users, passwords, sessions and page permissions are stored in browser `localStorage`. This is suitable for UI/demo testing. For production, replace it with server-side authentication/authorization and password hashing.
