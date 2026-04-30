# Refined Jira Ticket: CTT-178

## Purpose Statement

To reintroduce the OAuth member update flow within the Connect Widget. The removal of this flow (originally intended to prevent member combination issues) broke the critical migration path from non-OAuth to OAuth connections, resulting in duplicate members. This refinement ensures that users can successfully update existing members during non-OAuth to OAuth migrations, while also enabling the widget to gracefully handle cases where the backend provides a different member GUID than the one initially targeted for update (coordinated with backend fix DC-3040).

## User Stories

- **As a user migrating to an OAuth-enabled institution**, I want to be able to update my existing non-OAuth member so that I can maintain my transaction history and avoid creating a duplicate member.
- **As a developer**, I want the Connect Widget to robustly handle changes in member GUIDs during the OAuth connection phase, so that the application state remains synchronized with the backend regardless of whether the update resulted in a new or existing member record.

## Acceptance Criteria

- [ ] **Flow Reintroduction**: Restore the capability to initiate an "update" flow for members using OAuth.
- [ ] **Dynamic Member Synchronization**: Update the OAuth callback handling logic to upsert the `incoming_member_id` into redux state.
- [ ] **State Reconciliation**: If the `incoming_member_id` received from the OAuth state is not currently in the Redux store, the widget must fetch the new member record and integrate it into the active session state.
- [ ] **Error Handling**: Gracefully handle scenarios where fetching the "new" member GUID fails after a successful OAuth return.
- [ ] **Test Coverage**: Add unit or integration tests (using Vitest/MSW) that simulate:
  - A successful OAuth update where the GUID remains the same.
  - A successful OAuth update where the backend returns a _different_ GUID (migration/separation scenario).
- [ ] **Documentation**: Ensure all repository documentation, including READMEs, are updated to reflect the reintroduced flow and the logic for handling dynamic member IDs.

## Out of Scope

- **Backend Implementation**: The changes required in Firefly (handled via DC-3040) are external to this ticket.
- **Legacy MBR Combination Logic**: We are not reverting to the previous flawed logic; we are implementing a new synchronization pattern.
- **End-to-End OAuth Automation**: Improvements to the actual E2E testing infrastructure for real OAuth redirects (unless manageable via current mocks).

## Definition of Done

- [ ] Logic implemented for OAuth update and dynamic GUID synchronization.
- [ ] All new logic covered by unit/integration tests.
- [ ] Repository documentation (README, internal guides) updated.
- [ ] Pull Request follows Conventional Commit standards.
- [ ] PR reviewed and approved by the tech lead or designated peer.
- [ ] Verified that no regressions were introduced to the "Create Member" OAuth flow.
