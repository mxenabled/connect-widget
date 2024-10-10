# [←](../README.md#props) User Features

The connect widget uses user features to determine the behavior of the widget. Below is the structure of the user features object. Listed values are the defaults.

## `userFeatures`

The `userFeatures` object is the user features that the widget is initialized with.

```jsx
const userFeatures = {
  item: [
    {
      feature_name: string,
      guid: string | null,
      is_enabled: boolean,
    },
  ],
}
```

## User Features

<details>
  <summary>Supported User Features</summary>

| User Feature                            | Description                                                                                                                      | Data                                                                                                                                               |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER` | When enabled, adds a back button to the top of the widget and gets rid of any explicit back buttons                              | <pre><pre>{<br>&nbsp;feature_name: 'SHOW_CONNECT_GLOBAL_NAVIGATION_HEADER',<br>&nbsp;guid: 'FTR-123', <br>&nbsp;is_enabled: true <br>&nbsp;}</pre> |
| `CONNECT_COMBO_JOBS`                    | When enabled, the Connect widget will create COMBINATION jobs instead of individual jobs (aggregate, verification, reward, etc). | <pre>{<br>&nbsp;feature_name: 'CONNECT_COMBO_JOBS',<br>&nbsp;guid: 'FTR-123', <br>&nbsp;is_enabled: true <br>&nbsp;}</pre>                         |

</details>
<br />

[<-- Back to README](../README.md#props)
