# [←](../README.md#props) User Features

The connect widget uses user features to determine the behavior of the widget. Below is the structure of the user features object. Listed values are the defaults.

## `userFeatures`

The `userFeatures` object is the user features that the widget is initialized with.

```jsx
const userFeatures = [
  {
    feature_name: string,
    guid: string | null,
    is_enabled: boolean,
  },
]
```

## User Features

<details>
  <summary>Supported User Features</summary>

| User Feature                            | Description                                                                                                                      | Data                                                                                                                                               |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER` | When enabled, adds a back button to the top of the widget and gets rid of any explicit back buttons                              | <pre><pre>{<br>&nbsp;feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',<br>&nbsp;guid: 'FTR-123', <br>&nbsp;is_enabled: true <br>&nbsp;}</pre> |
| `CONNECT_COMBO_JOBS`                    | When enabled, the Connect widget will create COMBINATION jobs instead of individual jobs (aggregate, verification, reward, etc). | <pre>{<br>&nbsp;feature_name: 'CONNECT_COMBO_JOBS',<br>&nbsp;guid: 'FTR-123', <br>&nbsp;is_enabled: true <br>&nbsp;}</pre>                         |

</details>

## OAuth Member Synchronization

When updating a member via OAuth, it is possible for the backend to return a different member GUID (`inbound_member_guid`) than the one used to initiate the flow. This commonly occurs during migrations from non-OAuth to OAuth connections, or when a user signs in with a different set of credentials at the same institution.

The Connect Widget handles this synchronization automatically by:
1. Detecting the GUID change upon successful completion of the OAuth flow.
2. Fetching the new member's full record using the `loadMemberByGuid` callback.
3. Updating the internal Redux state to reflect the new `currentMemberGuid` and including the new member record in the list of active members.
4. Seamlessly transitioning the user to the `Connecting` step with the synchronized member data.
<br />

[<-- Back to README](../README.md#props)
