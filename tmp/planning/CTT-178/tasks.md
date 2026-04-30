## Objective & Context

Restore the OAuth member update flow and implement dynamic GUID synchronization in the Connect Widget. This ensures that users migrating from non-OAuth to OAuth connections can update their existing members correctly, even if the backend returns a different member GUID during the process (e.g., in migration or separation scenarios).

## Tasks

- [ ] 0.0 Setup Environment
  - [x] 0.1 Verify or create development branch `feature/CTT-178`
- [x] 1.0 Establish Quality Baseline
  - [x] 1.1 Run tests and linters to capture baseline metrics and save reports to `tmp/planning/CTT-178/baseline.txt`

### Implementation Tasks

- [ ] 2.0 Restore OAuth Update Initiation Flow (Agent: `General Senior Software Agent`)
  - [x] 2.1 RED: Update `src/views/oauth/__tests__/OAuthStep-test.tsx` to verify that if an existing member GUID is present, it is prioritized for OAuth URI generation.
  - [x] 2.2 GREEN: Modify `src/views/oauth/OAuthStep.js` to check for `member.guid` before `pendingOauthMember` in the OAuth initialization `useEffect`.
  - [x] 2.3 REFACTOR: Ensure the conditional logic for URI generation is clear and adheres to project standards.
  - [x] 2.4 CLEANUP: Run linter and verify `OAuthStep-test.tsx` passes.
  - [x] 2.5 Create git checkpoint: `feat(oauth): prioritize existing member for update flow`

- [ ] 3.0 Implement Dynamic GUID Synchronization Logic (Agent: `General Senior Software Agent`)
  - [x] 3.1 RED: Update `src/views/oauth/__tests__/WaitingForOAuth-test.tsx` to simulate a scenario where `inbound_member_guid` differs from the current member GUID and verify `api.loadMemberByGuid` is called.
  - [x] 3.2 GREEN: Modify the `oauthStateCompleted$` stream in `src/views/oauth/WaitingForOAuth.js` to detect GUID changes and fetch the new member record using `api.loadMemberByGuid`.
  - [x] 3.3 REFACTOR: Optimize the RxJS pipeline (using `mergeMap` and `defer`) and ensure robust error handling for the member fetch.
  - [x] 3.4 CLEANUP: Run linter and verify `WaitingForOAuth-test.tsx` passes.
  - [x] 3.5 Create git checkpoint: `feat(oauth): implement dynamic member guid synchronization`

- [ ] 4.0 Enhance Redux State Reconciliation (Agent: `General Senior Software Agent`)
  - [x] 4.1 RED: Add a test case to `src/views/oauth/__tests__/OAuthStep-test.tsx` verifying that `handleOAuthSuccess` dispatches `updateMemberSuccess` when a member object is provided.
  - [x] 4.2 GREEN: Update `handleOAuthSuccess` in `src/views/oauth/OAuthStep.js` to accept an optional `member` parameter and dispatch `connectActions.updateMemberSuccess` if present.
  - [x] 4.3 REFACTOR: Ensure the callback signature and dispatch logic are clean and type-safe.
  - [x] 4.4 CLEANUP: Run linter and verify all OAuth tests pass.
  - [x] 4.5 Create git checkpoint: `feat(oauth): dispatch member update on successful sync`

- [ ] 5.0 Verify Migration and Synchronization Scenarios (Agent: `General Senior Software Agent`)
  - [x] 5.1 RED: Create or update an integration test (e.g., in `src/__tests__/ConnectWidget-test.tsx`) using `apiValue` mocking to simulate a full migration flow where the GUID changes from `MBR-OLD` to `MBR-NEW`.
  - [x] 5.2 GREEN: Ensure the widget correctly transitions from `WaitingForOAuth` to `Connecting` with the new GUID and correct institution data.
  - [x] 5.3 REFACTOR: Clean up mock data and test utilities used for the integration test.
  - [x] 5.4 CLEANUP: Run full test suite and verify all integration tests pass.
  - [x] 5.5 Create git checkpoint: `test(oauth): add integration test for guid migration scenario`

- [x] 6.0 Verification & Regression Check (Agent: `General Senior Software Agent`)
  - [x] 6.1 Run full test suite and verify no regressions were introduced to existing OAuth or non-OAuth flows.
  - [x] 6.2 Run linters to verify code quality has not decreased compared to baseline.

- [x] 7.0 Review and Update Documentation (Agent: `tech-lead`)
  - [x] 7.1 DOCS: Update `docs/APIDOCUMENTATION.md` and `docs/USER_FEATURES.md` to reflect the reintroduced OAuth update flow and the dynamic GUID synchronization logic.
  - [x] 7.2 Create git checkpoint: `docs(oauth): document update flow and guid synchronization`

- [x] 8.0 Finalize Task
  - [x] 8.1 Squash all checkpoint commits into a single clean conventional commit: `feat(oauth): restore update flow and implement dynamic guid sync`

**Next Step**: Run `/swe:implement-plan CTT-178` to begin implementation.
