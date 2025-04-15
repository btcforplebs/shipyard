# Architecture Plan

## Overview

This document outlines the architecture and implementation plan for the application. It covers the drafts support functionality and the integration of queues into the dashboard.

---

## Backend

### Database
- The `Post` model in Prisma already includes an `isDraft` boolean field (default: true).
- There is an index on `isDraft` for efficient filtering.

### API Changes

#### Endpoints
- **GET `/api/posts`**:  
  - Accepts `is_draft` query parameter (`true`/`false`).
  - Returns posts filtered by draft status.
- **POST `/api/posts`**:  
  - Accepts `isDraft` in the request body.
  - Allows creation of both drafts and published posts.
- **PATCH/PUT `/api/posts/[post-id]`**:  
  - Allows updating `isDraft` (e.g., to publish a draft).

#### Service Layer
- `PostService.create` and `PostService.update` already support `isDraft`.
- `PostService.getByAccount` supports filtering by `isDraft`.

---

## Frontend

### Composer View
- Update "Save Draft" to call `/api/posts` with `isDraft: true`.
- Add support for editing existing drafts (load draft data into composer).
  - Implemented GET endpoint for `/api/posts/[post-id]` to fetch post data
  - Updated ThreadComposer to accept initialThread prop for editing
  - Added loading state while fetching post data
  - Modified PUT endpoint to properly handle rawEvents updates
- Add "Publish" action to update draft (`isDraft: false`) via PATCH/PUT.

### Dashboard
- Fetch and display the actual count of drafts (GET `/api/posts?account_pubkey=...&is_draft=true`).
- Make the "Drafts" card clickable to filter the list to only drafts.
- Update `DashboardContentQueue` to accept an `isDraft` prop and include it in the API request.
- Add UI indication when the list is filtered to drafts.

### Post List
- Update `QueueList` and related components to display draft status where appropriate.

---

## Tests

### Backend
- Test creating drafts and published posts.
- Test fetching drafts and published posts.
- Test updating a draft to published.

### Frontend
- Test saving a draft from the composer.
- Test publishing a draft.
- Test filtering the dashboard list to show only drafts.

---

## Next Steps

1. Update backend API endpoints and service layer.
2. Update frontend composer and dashboard.
3. Add and run tests for new functionality.
4. Publish progress updates to nostr.

---

# Queues Integration into Dashboard

## Overview

This section outlines the architecture and implementation plan for integrating the Queues functionality directly into the Dashboard. This change simplifies the UI by removing the separate Queues page and making queue filtering available directly in the Dashboard.

## Changes

### Navigation
- Removed "Queues" option from the sidebar to simplify navigation.
- All queue functionality is now accessible directly from the Dashboard.

### Components
- Created a reusable `QueueFilter` component in `/components/queues/queue-filter.tsx`.
- The `QueueFilter` component:
  - Fetches queues for the current account.
  - Allows filtering content by queue.
  - Includes a "New Queue" option that opens the existing NewQueueDialog.
  - Is designed to be reusable across the application.
- The `NewQueueDialog` component:
  - Allows users to create new queues with a name and optional description.
  - Makes an API call to create the queue in the backend using the current account's pubkey.
  - Provides appropriate feedback via toast notifications on success or failure.

### Dashboard Integration
- Added the `QueueFilter` component to the Dashboard, positioned to the left of the List/Calendar button group.
- Updated `DashboardContentQueue` to accept a `queueId` parameter for filtering content by queue.
- The Dashboard now serves as the central hub for viewing and managing content across all queues.

### Removed Code
- Completely removed the `/dashboard/queues` view and related code.
- Consolidated all queue-related functionality into the Dashboard.

### Tests
- Added API tests for the queues endpoints to ensure proper functionality.
- Tests cover GET, POST, and DELETE operations for queues.
- Tests verify proper error handling for missing parameters.

## Benefits
- Simplified navigation with fewer sidebar options.
- More intuitive content filtering directly in the Dashboard.
- Reduced code duplication and maintenance overhead.
- Improved user experience by centralizing content management.

---
**Confidence Score:** 8/10
The architecture is clear and the implementation is straightforward. The main challenge was ensuring proper integration of the queue filtering with the existing dashboard functionality.

---

# Authentication and Token Refresh

## Overview

This section outlines the authentication flow and token refresh mechanism implemented in the application. The application uses NIP-98 events for authentication and JWT tokens for maintaining sessions.

## Authentication Flow

1. **Initial Login:**
   - User connects using a Nostr browser extension (NIP-07)
   - A NIP-98 AUTH event is created and signed by the extension
   - The signed event is sent to the backend `/api/auth/login` endpoint
   - The backend validates the event and returns a JWT token
   - The token is stored in localStorage and as a cookie

2. **API Requests:**
   - All API requests include the JWT token in the Authorization header
   - The backend validates the token for each request
   - If the token is valid, the request is processed

3. **Token Expiration Handling:**
   - When a 401 "Token expired" error is received:
     - The application automatically creates a new NIP-98 AUTH event
     - The event is signed using the browser extension
     - A new token is obtained from the backend
     - The original request is retried with the new token
   - If token refresh fails (e.g., browser extension unavailable):
     - The user is redirected to the login page

## Implementation Details

- The token refresh logic is implemented in the `lib/api.ts` file
- All API functions (fetcher, apiGet, apiPost, apiPut, apiDelete) include token refresh handling
- The `refreshAuthToken` function handles the creation of a new NIP-98 event and token acquisition
- The application dispatches a storage event to notify other tabs about token changes

## Benefits

- Seamless user experience with automatic token refresh
- No user intervention required for token expiration in most cases
- Graceful fallback to login page when automatic refresh is not possible
- Consistent handling across all API functions

**Confidence Score:** 9/10
The token refresh implementation is robust and handles various edge cases appropriately.
The architecture is clear and the implementation is straightforward. The main challenge was ensuring proper integration of the queue filtering with the existing dashboard functionality.
