# Drafts Support Architecture Plan

## Overview

This document outlines the architecture and implementation plan for supporting "drafts" in the application. Drafts allow users to save posts in-progress, view the number of drafts, and filter the dashboard to show only drafts. The backend, frontend, and tests will be updated accordingly.

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

**Confidence Score:** 9/10  
The architecture is clear and the codebase is well-structured for these changes. Minor uncertainties may arise in UI/UX details during implementation.
