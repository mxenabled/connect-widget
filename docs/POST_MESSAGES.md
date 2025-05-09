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

| Type                                       | Description                                                                                                                                                                                | Data                                                                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `mx/connect/backToSearch`                  | Triggers when an end user selects a button that will navigate them to the search institution step in the Connect Widget. Used in relation with `disable_institution_search` config option. | <pre>{}</pre>                                                                                                                                                                    |
| `mx/connect/loaded`                        | Triggers when the Connect Widget has loaded. `initial_step` can be `connected`, `disclosure`, `enterCreds`, `loginError`, `mfa`, `search`, `verifyExistingMember` or `verifyMfa`.          | <pre>{<br>&nbsp; "initial_step": string<br>}</pre>                                                                                                                               |
| `mx/connect/initialDataReady`              | Triggers when the initial data for a job on a member is complete and ready for use.                                                                                                        | <pre>{<br>&nbsp; "member_guid": string<br>}</pre>                                                                                                                                |
| `mx/connect/enterCredentials`              | Triggers when a user submits credentials for a given institution for the first time.                                                                                                       | <pre>{<br>&nbsp; "institution": {<br>&nbsp;&nbsp;&nbsp;&nbsp; "code": string,<br>&nbsp;&nbsp;&nbsp;&nbsp; "guid": string<br>&nbsp; }<br>}</pre>                                  |
| `mx/connect/institutionSearch`             | Triggers when the end user searches for an institution.                                                                                                                                    | <pre>{<br>&nbsp; "query": string<br>}</pre>                                                                                                                                      |
| `mx/connect/selectedInstitution`           | Triggers when the end user selects an institution from the institution list.                                                                                                               | <pre>{<br>&nbsp; "code": string,<br>&nbsp; "guid": string,<br>&nbsp; "name": string,<br>&nbsp; "url": string<br>}</pre>                                                          |
| `mx/connect/invalidData`                   | Triggers when there are no valid demand deposit (DDA) accounts on the member. Current options for `code`: `1000`                                                                           | <pre>{<br>&nbsp; "code": string,<br>&nbsp; "member_guid": string<br>}</pre>                                                                                                      |
| `mx/connect/invalidData/primaryAction`     | Triggered when the user clicks the "Try again" option on the invalid data step.                                                                                                            | <pre>{<br>&nbsp; "member_guid": string<br>}</pre>                                                                                                                                |
| `mx/connect/memberConnected`               | Triggers when a member has successfully connected and the data you requested in your config has finished aggregating.                                                                      | <pre>{<br>&nbsp; "member_guid": string<br>}</pre>                                                                                                                                |
| `mx/connect/memberConnected/primaryAction` | Triggered when the user clicks the primary button on the member connected step.                                                                                                            | <pre>{}</pre>                                                                                                                                                                    |
| `mx/connect/memberError`                   | Triggers when a member has encountered an error state.                                                                                                                                     | <pre>{<br>&nbsp; "member": {<br>&nbsp;&nbsp;&nbsp;&nbsp; "guid": string,<br>&nbsp;&nbsp;&nbsp;&nbsp; "connection_status": number<br>&nbsp; }<br>}</pre>                          |
| `mx/connect/createMemberError`             | Triggers when a member failed to get created when credentials were entered.                                                                                                                | <pre>{<br>&nbsp; "institution_guid": string,<br>&nbsp; "institution_code": string<br>}</pre>                                                                                     |
| `mx/connect/memberDeleted`                 | Triggers when a member has been deleted in the widget.                                                                                                                                     | <pre>{<br>&nbsp; "member_guid": string<br>}</pre>                                                                                                                                |
| `mx/connect/memberStatusUpdated`           | Triggers when a members connection status has changed while connecting. This is useful in determing the current connection status of the member.                                           | <pre>{<br>&nbsp; "member_guid": string,<br>&nbsp; "connection_status": number<br>}</pre>                                                                                         |
| `mx/connect/oauthError`                    | Triggered when the user lands on the OAuth error page.                                                                                                                                     | <pre>{<br>&nbsp; "member_guid": string<br>}</pre>                                                                                                                                |
| `mx/connect/oauthRequested`                | Triggers when the user navigates to the OAuth provider's site. Note that the redirect does not happen in WebViews.                                                                         | <pre>{<br>&nbsp; "url": string,<br>&nbsp; "member_guid": string<br>}</pre>                                                                                                       |
| `mx/connect/stepChange`                    | Triggers when the end user changes from one "step" to another.                                                                                                                             | <pre>{<br>&nbsp; "previous": string,<br>&nbsp; "current": string<br>}</pre>                                                                                                      |
| `mx/connect/submitMfa`                     | Triggers when a user submits an MFA answer.                                                                                                                                                | <pre>{<br>&nbsp; "member_guid": string<br>}</pre>                                                                                                                                |
| `mx/connect/updateCredentials`             | Triggers when a user submits credentials while trying to update their existing credentials.                                                                                                | <pre>{<br>&nbsp; "member_guid": string,<br>&nbsp; "institution": {<br>&nbsp;&nbsp;&nbsp;&nbsp; "code": string,<br>&nbsp;&nbsp;&nbsp;&nbsp; "guid": string<br>&nbsp; }<br>}</pre> |

</details>

<br />

[<-- Back to README](../README.md#props)
