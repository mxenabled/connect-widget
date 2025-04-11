# [←](../README.md#props) Profiles

The connect widget uses the profiles to set the initial state of the widget. Below is the structure of the profiles object. Listed values are the defaults.

## `client`

The `client` object is the client that the widget is connected to.

<details>
  <summary>Client Flags</summary>

| Field                      | Type              | Description                                                           | Required |
| -------------------------- | ----------------- | :-------------------------------------------------------------------- | :------: |
| `guid`                     | `string`          | This guid is used to look up client logo in logo header component.    | **Yes**  |
| `has_atrium_api`           | `boolean \| null` | This field is for advance customizations. Use with cation.            |    No    |
| `has_limited_institutions` | `boolean \| null` | This field is for advance customizations. Use with cation.            |    No    |
| `oauth_app_name`           | `string`          | This name is used in the copy on disclosure views and Connected view. | **Yes**  |

</details>

## `clientProfile`

The `clientProfile` object is the profile of the client.

<details>
  <summary>Client Profile Flags</summary>

| Field                                  | Type                              | Description                                                                                                                                                                                                                                                                                   | Required |
| -------------------------------------- | --------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------: |
| `account_verification_is_enabled`      | `boolean \| null`                 | When enabled, the widget will be able to run in `verification` mode.                                                                                                                                                                                                                          |
| `account_identification_is_enabled`    | `boolean \| null`                 | When enabled, the widget will be able to run identification job.                                                                                                                                                                                                                              |    No    |
| `custom_copy_namespace`                | `string \| null`                  | Customize individual copy/text throughout the widget. Create a file in the language directory, `{namespace}_custom_copy-{lang}.json`. `namespace` matches this field and `locale` matches to `locale` config below. Add entry to [`CLIENT_CUSTOM_COPY`](../src/utilities/Personalization.js). |    No    |
| `is_microdeposits_enabled`             | `boolean \| null`                 | When enabled, the widget will be able to fallback to microdeposit solution if `verification` mode isn't supported for institution. Must also enable `show_microdeposits_in_connect` in `widgetProfile`.                                                                                       |    No    |
| `locale`                               | `'en' \| 'es' \| 'fr-ca' \| null` | The connect widget supports multiple languages. Supported locale options: `en`, `es`, and `fr-ca`.                                                                                                                                                                                            |    No    |
| `show_external_link_popup`             | `boolean \| null`                 | When enabled, users will be notified when clicking a link that navigates away from the widget.                                                                                                                                                                                                |    No    |
| `tax_statement_is_enabled`             | `boolean \| null`                 | When enabled, the widget will be able to run in `tax` mode.                                                                                                                                                                                                                                   |    No    |
| `use_cases_is_enabled`                 | `boolean \| null`                 | \*_More details coming soon._                                                                                                                                                                                                                                                                 |    No    |
| `uses_custom_popular_institution_list` | `boolean \| null`                 | This field is for advance customizations. Use with cation.                                                                                                                                                                                                                                    |    No    |
| `uses_oauth`                           | `boolean \| null`                 | When enabled, the widget will use OAuth to authenticate when available. \*_More details coming soon._                                                                                                                                                                                         |    No    |

</details>

## `clientColorScheme`

The `clientColorScheme` object is the color scheme of the client.

<details>
  <summary>Client Color Scheme Flags</summary>

| Field                | Type             | Description                                 | Required |
| -------------------- | ---------------- | :------------------------------------------ | :------: |
| `primary_100`        | `string \| null` | Override color scheme of the widgets theme. |    No    |
| `primary_200`        | `string \| null` | Override color scheme of the widgets theme. |    No    |
| `primary_300`        | `string \| null` | Override color scheme of the widgets theme. |    No    |
| `primary_400`        | `string \| null` | Override color scheme of the widgets theme. |    No    |
| `primary_500`        | `string \| null` | Override color scheme of the widgets theme. |    No    |
| `primary_color`      | `string \| null` | Override color scheme of the widgets theme. |    No    |
| `secondary_color`    | `string \| null` | Override color scheme of the widgets theme. |    No    |
| `widget_brand_color` | `string \| null` | Override color scheme of the widgets theme. |    No    |

</details>

## `user`

The `user` object is the user of the client.

<details>
  <summary>User Flags</summary>

| Field   | Type     | Description                                                                | Required |
| ------- | -------- | :------------------------------------------------------------------------- | :------: |
| `guid`  | `string` | This guid is sent in the body of the Microdeposit create and update calls. | **Yes**  |
| `email` | `string` | This email is sent with support tickets.                                   |    No    |

</details>

## `userProfile`

The `userProfile` object is the profile of the user.

<details>
  <summary>User Profile Flags</summary>

| Field                          | Type             | Description                                          | Required |
| ------------------------------ | ---------------- | :--------------------------------------------------- | :------: |
| `too_small_modal_dismissed_at` | `string \| null` | Used to determine when the modal was last dismissed. |    No    |

</details>

## `widgetProfile`

The `widgetProfile` object is the profile of the widget.

<details>
  <summary>Widget Profile Flags</summary>

| Field                           | Type              | Description                                                                                                                                             | Required |
| ------------------------------- | ----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ | :------: |
| `display_disclosure_in_connect` | `boolean \| null` | When enabled, the original "heavy" disclosure is used. When disabled(_default_), the new "light" disclosure is used.                                    |    No    |
| `enable_manual_accounts`        | `boolean \| null` | When enabled(_default_), the manual accounts option is shown. Supported in `aggregation` mode only.                                                     |    No    |
| `enable_support_requests`       | `boolean \| null` | When enabled(_default_), the support request options are shown. Supported in `aggregation` mode only.                                                   |    No    |
| `show_microdeposits_in_connect` | `boolean \| null` | When enabled, the microdeposits option is shown. Supported in `verification` mode only. Must also enable `is_microdeposits_enabled` in `clientProfile`. |    No    |
| `show_mx_branding`              | `boolean \| null` | -                                                                                                                                                       |    No    |

</details>
<br />
<br />

[<-- Back to README](../README.md#props)
