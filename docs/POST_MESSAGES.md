# [←](../README.md#props) Post Messages

The connect widget uses post messages to communicate with the parent window.

## `onPostMessage`

The `onPostMessage` function is used to send messages to the parent window.

```jsx
const onPostMessage = (event: string, data?: object) => {
  console.log('onPostMessage', event, data)
}
```

## Post Messages

<details>
  <summary>Post Message Events</summary>

| Type                             | Description                                                                                                                                                                                | Data                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `/backToSearch`                  | Triggers when an end user selects a button that will navigate them to the search institution step in the Connect Widget. Used in relation with `disable_institution_search` config option. | `{}`                                                                           |
| `/loaded`                        | Triggers when the Connect Widget has loaded. `initial_step` can be `connected`, `disclosure`, `enterCreds`, `loginError`, `mfa`, `search`, `verifyExistingMember` or `verifyMfa`.          | `{ "initial_step": string }`                                                   |
| `/enterCredentials`              | Triggers when a user submits credentials for a given institution for the first time.                                                                                                       | `{ "institution": { "code": string, "guid": string } }`                        |
| `/institutionSearch`             | Triggers when the end user searches for an institution.                                                                                                                                    | `{ "query": string }`                                                          |
| `/selectedInstitution`           | Triggers when the end user selects an institution from the institution list.                                                                                                               | `{ "code": string, "guid": string, "name": string, "url": string }`            |
| `/invalidData`                   | Triggers when there are no valid demand deposit (DDA) accounts on the member. Current options for `code`: `1000`                                                                           | `{ "code": string, "member_guid": string}`                                     |
| `/invalidData/primaryAction`     | Triggered when the user clicks the "Try again" option on the invalid data step.                                                                                                            | `{  "member_guid": string }`                                                   |
| `/memberConnected`               | Triggers when a member has successfully connected and the data you requested in your config has finished aggregating.                                                                      | `{ "member_guid": string }`                                                    |
| `/memberConnected/primaryAction` | Triggered when the user clicks the primary button on the member connected step.                                                                                                            | `{}`                                                                           |
| `/memberError`                   | Triggers when a member has encountered an error state.                                                                                                                                     | `{ "member": { "guid": string, "connection_status: number } }`                 |
| `/createMemberError`             | Triggers when a member failed to get created when credentials were entered.                                                                                                                | `{ "institution_guid": string, "institution_code": string }`                   |
| `/memberDeleted`                 | Triggers when a member has been deleted in the widget.                                                                                                                                     | `{ "member_guid": string }`                                                    |
| `/memberStatusUpdated`           | Triggers when a members connection status has changed while connecting. This is useful in determing the current connection status of the member.                                           | `{ "member_guid": string, "connection_status": number }`                       |
| `/oauthError`                    | Triggered when the user lands on the OAuth error page.                                                                                                                                     | `{ "member_guid": string }`                                                    |
| `/oauthRequested`                | Triggers when the user navigates to the OAuth provider's site. Note that the redirect does not happen in WebViews.                                                                         | `{ "url": string, "member_guid": string }`                                     |
| `/stepChange`                    | Triggers when the end user changes from one "step" to another.                                                                                                                             | `{ "previous": string, "current": string }`                                    |
| `/submitMfa`                     | Triggers when a user submits an MFA answer.                                                                                                                                                | `{ "member_guid": string }`                                                    |
| `/updateCredentials`             | Triggers when a user submits credentials while trying to update their existing credentials.                                                                                                | `{ "member_guid": string, "institution": { "code": string, "guid": string } }` |

</details>

<br />

[<-- Back to README](../README.md#props)
