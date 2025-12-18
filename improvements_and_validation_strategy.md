# SlashData Vehicle Portal: Quality Assurance & Enhancement Strategy

This document outlines a roadmap for elevating the quality of the SlashData Vehicle Portal. It focuses on robust data validation, user experience improvements, and technical debt reduction.

---

## 1. Data Validation Strategy

As a Master Data Management (MDM) tool, data integrity is paramount.

### 1.1 Frontend Validation (Client-Side)
*   **Standardize Zod Schemas:** Apply `zod` + `react-hook-form` to **all** forms to prevent invalid data entry.
*   **Manual ID Rules:** Enforce strict alphanumeric patterns for Makes and numeric-only for Models/Types.
*   **Manual ID Collision Prevention (Critical):**
    *   Before allowing a save on a manually entered ID, the system should perform a background check (debounced) to ensure the ID is not already assigned to another record.
*   **Mandatory Mapping Fields:** In the mapping popup, both Make and Model are now mandatory before "MAPPED" status can be saved.

### 1.2 Rejection & Lifecycle Validation
*   **Visibility Logic:** Ensure that a "Rejected" item (which removes the SD link) immediately reappears in the "Pending Mapping" queue under the `UNMAPPED` filter.
*   **Audit Continuity:** Even when a mapping row is deleted (Rejected), the `ADPMappingHistory` must persist so admins can see why it was rejected previously.

---

## 2. User Experience (UX) Enhancements

### 2.1 Refined Filter & Search UI
*   **Persistent Search:** The search query should be the primary tool for finding records. It now covers Make, Model, and ID fields simultaneously.
*   **Search Match Highlighting (New):**
    *   Implement visual highlighting of search terms within table results (e.g., bolding "Camry" in results when "Cam" is searched).
*   **Status Breadcrumbs:** Provide clear visual feedback when filters are active (e.g., "Showing: Missing Models").
*   **Empty State Actions:** Don't just show "No results"; provide a "Clear Filters" or "Add Item" button to keep the workflow moving.

### 2.2 Advanced Filtering
*   **Proper Filters:** In "Pending ADP Mapping", the filter bar is now separated from the header, providing more space for search and date range pickers.
*   **Debounced Search:** Implement a 300ms debounce on the search input to reduce API pressure while providing a "live" feel.

---

## 3. Technical Architecture Improvements

### 3.1 Caching & Synchronization
*   **Invalidation Logic:** When a mapping is rejected or approved, explicitly invalidate the `adpMappings` AND `stats` queries to ensure counters update across the dashboard and lists.

### 3.2 Error Handling
*   **API Error Feedback:** Use the global interceptor to show specific error messages if a mapping fails (e.g., "This Model ID is already in use").

### 3.3 Activity Log Enrichment (New)
*   **Current Issue:** The activity log currently only returns IDs and status.
*   **Improvement:** Update the backend DTO for `/dashboard/activity` to include:
    *   `userName`: The full name of the person who made the change.
    *   `vehicleDescription`: A friendly string of the vehicle involved (e.g. "Toyota Camry").
    *   `previousStatus`: To show the transition (e.g. "UNMAPPED -> MAPPED").

---

## 4. AI & Advanced Insights

### 4.1 Mapping Confidence Heatmaps (New)
*   Visual dashboard showing which manufacturers have the most "Manual Intervention" vs "AI Autodetect" success. Helps identify data quality issues from specific source feeds.

---

## 5. Implementation Checklist

### Phase 1: Hardening (Current)
- [X] Proper Filter/Search UI for Vehicle Types and Pending Mapping.
- [X] Enforce mandatory Make/Model for mappings.
- [X] Documentation for Backend Rejection flow.

### Phase 2: UX Improvements
- [ ] Implement debounced search for all lists.
- [ ] **Action:** Implement Search Match Highlighting in tables.
- [ ] Add "History" button directly to the mapping table rows.
- [ ] Add "Download Template" helper for CSV imports in all relevant views.

### Phase 3: Infrastructure (Long Term)
- [ ] Activity Log DTO Enrichment (Backend work required).
- [ ] Real-time ID availability check on creation forms.
