# [←](../README.md#props) Profiles

The connect widget uses the profiles to set the initial state of the widget. Below is the structure of the profiles object. Listed values are the defaults.

## `client`

The `client` object is the client that the widget is connected to.

<details>
  <summary>Client Flags</summary>

| Field                      | Type              | Description | Required |
| -------------------------- | ----------------- | :---------: | :------: |
| `guid`                     | `string`          |      -      | **Yes**  |
| `default_institution_guid` | `string \| null`  |      -      |    No    |
| `external_guid`            | `string`          |      -      | **Yes**  |
| `has_atrium_api`           | `boolean \| null` |      -      |    No    |
| `has_limited_institutions` | `boolean \| null` |      -      |    No    |
| `name`                     | `string`          |      -      | **Yes**  |
| `oauth_app_name`           | `string`          |      -      | **Yes**  |
| `url`                      | `string`          |      -      | **Yes**  |

</details>

## `clientProfile`

The `clientProfile` object is the profile of the client.

<details>
  <summary>Client Profile Flags</summary>

| Field                                  | Type                              | Description | Required |
| -------------------------------------- | --------------------------------- | :---------: | :------: |
| `account_verification_is_enabled`      | `boolean \| null`                 |      -      |    No    |
| `client_guid`                          | `string`                          |      -      | **Yes**  |
| `custom_copy_namespace`                | `string \| null`                  |      -      |    No    |
| `institution_display_name`             | `string \| null`                  |      -      |    No    |
| `is_microdeposits_enabled`             | `boolean \| null`                 |      -      |    No    |
| `locale`                               | `'en' \| 'es' \| 'fr-ca' \| null` |      -      |    No    |
| `privacy_policy_url`                   | `string \| null`                  |      -      |    No    |
| `show_external_link_popup`             | `boolean \| null`                 |      -      |    No    |
| `tax_statement_is_enabled`             | `boolean \| null`                 |      -      |    No    |
| `use_cases_is_enabled`                 | `boolean \| null`                 |      -      |    No    |
| `uses_custom_popular_institution_list` | `boolean \| null`                 |      -      |    No    |
| `uses_oauth`                           | `boolean \| null`                 |      -      |    No    |

</details>

## `clientColorScheme`

The `clientColorScheme` object is the color scheme of the client.

<details>
  <summary>Client Color Scheme Flags</summary>

| Field                | Type             | Description | Required |
| -------------------- | ---------------- | :---------: | :------: |
| `primary_100`        | `string \| null` |      -      |    No    |
| `primary_200`        | `string \| null` |      -      |    No    |
| `primary_300`        | `string \| null` |      -      |    No    |
| `primary_400`        | `string \| null` |      -      |    No    |
| `primary_500`        | `string \| null` |      -      |    No    |
| `primary_color`      | `string \| null` |      -      |    No    |
| `secondary_color`    | `string \| null` |      -      |    No    |
| `widget_brand_color` | `string \| null` |      -      |    No    |

</details>

## `user`

The `user` object is the user of the client.

<details>
  <summary>User Flags</summary>

| Field                              | Type              | Description | Required |
| ---------------------------------- | ----------------- | :---------: | :------: |
| `guid`                             | `string`          |      -      | **Yes**  |
| `client_guid`                      | `string`          |      -      | **Yes**  |
| `email`                            | `string`          |      -      | **Yes**  |
| `email_is_verified`                | `boolean`         |      -      | **Yes**  |
| `external_guid`                    | `string \| null`  |      -      |    No    |
| `first_name`                       | `string`          |      -      | **Yes**  |
| `has_accepted_terms`               | `boolean`         |      -      | **Yes**  |
| `has_password`                     | `boolean \| null` |      -      |    No    |
| `has_updated_terms_and_conditions` | `boolean`         |      -      | **Yes**  |
| `last_name`                        | `string`          |      -      | **Yes**  |
| `metadata`                         | `string \| null`  |      -      |    No    |
| `uses_single_sign_on`              | `boolean \| null` |      -      |    No    |

</details>

## `userProfile`

The `userProfile` object is the profile of the user.

<details>
  <summary>User Profile Flags</summary>

| Field                          | Type             | Description | Required |
| ------------------------------ | ---------------- | :---------: | :------: |
| `guid`                         | `string`         |      -      | **Yes**  |
| `too_small_modal_dismissed_at` | `string \| null` |      -      |    No    |
| `user_guid`                    | `string`         |      -      | **Yes**  |

</details>
<br />
<br />

[<-- Back to README](../README.md#props)
