## API Documentation

#### addMember

<details>
 <summary><code>POST</code> <code><b>/</b></code> <code>(creates a new institution member)</code></summary>

##### Parameters

> | name                               | type     | data type | description                                                                                                                                                                                                                                                                                                                  |
> | ---------------------------------- | -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | background_aggregation_is_disabled | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | credentials                        | required | object    | NA                                                                                                                                                                                                                                                                                                                           |
> | include_transactions               | required | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | institution_guid                   | required | string    | NA                                                                                                                                                                                                                                                                                                                           |
> | is_oauth                           | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | metadata                           | optional | string    | NA                                                                                                                                                                                                                                                                                                                           |
> | skip_aggregation                   | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | referral_source                    | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | ui_message_webview_url_scheme      | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | client_redirect_url                | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | enable_app2app                     | optional | boolean   | This indicates whether OAuth app2app behavior is enabled for institutions that support it. Defaults to true. When set to false, any oauth_window_uri generated will not direct the end user to the institution's mobile application. This setting is not persistent. This setting currently only affects Chase institutions. |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}}` |
> | `400`     | `application/json` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889/
> ```

</details>

---

#### updateMember

<details>
 <summary><code>POST</code> <code><b>/members/{member_guid}</b></code> <code>(updates institution member by its guid)</code></summary>

##### Parameters

> | name                               | type     | data type | description                                                                                                                                                                                                                                                                                                                  |
> | ---------------------------------- | -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | background_aggregation_is_disabled | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | credentials                        | required | object    | NA                                                                                                                                                                                                                                                                                                                           |
> | include_transactions               | required | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | institution_guid                   | required | string    | NA                                                                                                                                                                                                                                                                                                                           |
> | is_oauth                           | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | metadata                           | optional | string    | NA                                                                                                                                                                                                                                                                                                                           |
> | skip_aggregation                   | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | referral_source                    | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | ui_message_webview_url_scheme      | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | client_redirect_url                | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | enable_app2app                     | optional | boolean   | This indicates whether OAuth app2app behavior is enabled for institutions that support it. Defaults to true. When set to false, any oauth_window_uri generated will not direct the end user to the institution's mobile application. This setting is not persistent. This setting currently only affects Chase institutions. |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}}` |
> | `400`     | `application/json` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889/members/{member_guid}
> ```

</details>

---

#### updateMFA

<details>
 <summary><code>POST</code> <code><b>/members/{member_guid}/update_mfa</b></code> <code>(updates MFA for a member)</code></summary>

##### Parameters

> | name                               | type     | data type | description                                                                                                                                                                                                                                                                                                                  |
> | ---------------------------------- | -------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | background_aggregation_is_disabled | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | credentials                        | required | object    | NA                                                                                                                                                                                                                                                                                                                           |
> | include_transactions               | required | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | institution_guid                   | required | string    | NA                                                                                                                                                                                                                                                                                                                           |
> | is_oauth                           | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | metadata                           | optional | string    | NA                                                                                                                                                                                                                                                                                                                           |
> | skip_aggregation                   | optional | boolean   | NA                                                                                                                                                                                                                                                                                                                           |
> | referral_source                    | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | ui_message_webview_url_scheme      | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | client_redirect_url                | optional | string    | N/A                                                                                                                                                                                                                                                                                                                          |
> | enable_app2app                     | optional | boolean   | This indicates whether OAuth app2app behavior is enabled for institutions that support it. Defaults to true. When set to false, any oauth_window_uri generated will not direct the end user to the institution's mobile application. This setting is not persistent. This setting currently only affects Chase institutions. |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}}` |
> | `400`     | `application/json` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889//members/{member_guid}/update_mfa
> ```

</details>

---

#### deleteMember

<details>
  <summary><code>DELETE</code> <code><b>/members/{member_guid}</b></code> <code>(deletes member by its guid)</code></summary>

##### Parameters

> | name   | type     | data type | description                           |
> | ------ | -------- | --------- | ------------------------------------- |
> | `guid` | required | string    | The specific member unique idendifier |

##### Responses

> | http code | content-type       | response |
> | --------- | ------------------ | -------- |
> | `200`     | `application/json` |          |
> | `400`     | `application/json` |          |

##### Example cURL

> ```javascript
>  curl -X DELETE -H "Content-Type: application/json" http://localhost:8889//members/{member_guid}
> ```

</details>

---

#### loadMembers

<details>
 <summary><code>GET</code> <code><b>/members</b></code> <code>(returns an array of members associated with a specific user)</code></summary>

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"members": [{ "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}]}` |
> | `400`     | `application/json` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/members
> ```

</details>

---

#### loadMemberByGuid

<details>
 <summary><code>GET</code> <code><b>/members/{member_guid}</b></code> <code>(returns a specific member by its guid)</code></summary>

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}}` |
> | `400`     | `application/json` |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/members/{member_guid}
> ```

</details>

---

#### loadOAuthStates

<details>
 <summary><code>GET</code> <code><b>/oauth_states/{query_parameters}</b></code> <code>(returns an array of OAuth States)</code></summary>

##### Parameters

> | name                   | type     | data type | description |
> | ---------------------- | -------- | --------- | ----------- |
> | `outbound_member_guid` | optional | string    |             |
> | `oauth_status`         | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                      |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `[{ "guid": "OAS-1","auth_status": 1,"created_at": "2023-07-27T20:13:44+00:00","error_reason": null,"first_retrieved_at": null, "inbound_member_guid": null,"outbound_member_guid": "MBR-1","updated_at": "2023-07-27T20:13:44+00:00","user_guid": "USR-1"}]` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/oauth_states/{query_parameters}
> ```

</details>

---

#### loadOAuthState

<details>
 <summary><code>GET</code> <code><b>/oauth_states/{oauth_state_guid}</b></code> <code>(returns a specific OAuthState by its guid)</code></summary>

##### Parameters

> | name                   | type     | data type | description |
> | ---------------------- | -------- | --------- | ----------- |
> | `outbound_member_guid` | optional | string    |             |
> | `oauth_status`         | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                       |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `200`     | `application/json` | `{"oauth_state": { "guid": "OAS-1","auth_status": 1"created_at": "2023-07-31T21:37:22+00:00","error_reason": null,"first_retrieved_at": null,"inbound_member_guid": null,"outbound_member_guid": "MBR-123","updated_at": "2023-07-31T21:37:22+00:00","user_guid": "USR-123"}}` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/oauth_states/{oauth_state_guid}
> ```

</details>

---

#### createSupportTicket

<details>
 <summary><code>POST</code> <code><b>/support_tickets</b></code> <code>(creates a ticket for the support team)</code></summary>

##### Parameters

> | name      | type     | data type | description |
> | --------- | -------- | --------- | ----------- |
> | `email`   | optional | string    |             |
> | `tittle`  | optional | string    |             |
> | `message` | optional | string    |             |

##### Responses

> | http code | content-type       | response |
> | --------- | ------------------ | -------- |
> | `200`     | `application/json` |          |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889/support_tickets
> ```

</details>

---

#### loadInstitutions

<details>
 <summary><code>GET</code> <code><b>/institutions</b></code> <code>(returns an array of institutions)</code></summary>

##### Parameters

> | name                                | type     | data type | description |
> | ----------------------------------- | -------- | --------- | ----------- |
> | `search_name`                       | optional | string    |             |
> | `routing_number`                    | optional | string    |             |
> | `page`                              | optional | number    |             |
> | `per_page`                          | optional | number    |             |
> | `account_verification_is_enabled`   | optional | boolean   |             |
> | `account_identification_is_enabled` | optional | boolean   |             |
> | `tax_statement_is_enabled`          | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `[{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}]` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/institutions
> ```

</details>

---

#### loadInstitutionByGuid

<details>
 <summary><code>GET</code> <code><b>/institutions/{institution_guid}</b></code> <code>(returns an institution by its guid)</code></summary>

##### Parameters

> | name               | type     | data type | description |
> | ------------------ | -------- | --------- | ----------- |
> | `institution_guid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
> | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/institutions/{institution_guid}
> ```

</details>

---

#### loadInstitutionByCode

<details>
 <summary><code>GET</code> <code><b>/institutions/{code}</b></code> <code>(returns an institution by its code)</code></summary>

##### Parameters

> | name   | type     | data type | description      |
> | ------ | -------- | --------- | ---------------- |
> | `code` | optional | string    | institution code |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
> | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/institutions/{code}
> ```

</details>

---

#### loadPopularInstitutions

<details>
 <summary><code>GET</code> <code><b>/institutions/favorite</b></code> <code>(returns popular institutions)</code></summary>

##### Parameters

> | name                                | type     | data type | description |
> | ----------------------------------- | -------- | --------- | ----------- |
> | `per_page`                          | optional | number    |             |
> | `account_verification_is_enabled`   | optional | boolean   |             |
> | `account_identification_is_enabled` | optional | boolean   |             |
> | `tax_statement_is_enabled`          | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `[{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}]` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/institutions/favorite
> ```

</details>

---

#### loadDiscoveredInstitutions

<details>
 <summary><code>GET</code> <code><b>/institutions/discovered</b></code> <code>(returns discovered institutions)</code></summary>

##### Parameters

> | name                                | type     | data type | description |
> | ----------------------------------- | -------- | --------- | ----------- |
> | `per_page`                          | optional | number    |             |
> | `account_verification_is_enabled`   | optional | boolean   |             |
> | `account_identification_is_enabled` | optional | boolean   |             |
> | `tax_statement_is_enabled`          | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `[{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}]` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/institutions/discovered
> ```

</details>

---

#### createAccount

<details>
 <summary><code>POST</code> <code><b>/accounts</b></code> <code>(creates a manual account)</code></summary>

##### Parameters

> | name            | type     | data type | description |
> | --------------- | -------- | --------- | ----------- |
> | `account_type`  | optional | string    |             |
> | `balance`       | optional | number    |             |
> | `interest_rate` | optional | number    |             |
> | `is_personal`   | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                         |
> | --------- | ------------------ | ------------------------------------------------ |
> | `200`     | `application/json` | `{"guid": "ACC-123","account_type": "CHECKING"}` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889/accounts
> ```

</details>

---

#### createMicrodeposit

<details>
 <summary><code>POST</code> <code><b>/microdeposits</b></code> <code>(creates a new microdeposit)</code></summary>

##### Parameters

> | name             | type     | data type | description |
> | ---------------- | -------- | --------- | ----------- |
> | `account_name`   | optional | string    |             |
> | `account_number` | optional | string    |             |
> | `account_type`   | optional | number    |             |
> | `user_guid`      | optional | string    |             |
> | `email`          | optional | string    |             |
> | `first_name`     | optional | string    |             |
> | `last_name`      | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889/microdeposits
> ```

</details>

---

#### loadMicrodepositByGuid

<details>
 <summary><code>GET</code> <code><b>/microdeposits/{microdeposit_guid}</b></code> <code>(creates a manual account)</code></summary>

##### Parameters

> | name                | type     | data type | description |
> | ------------------- | -------- | --------- | ----------- |
> | `microdeposit_guid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/microdeposits/{microdeposit_guid}
> ```

</details>

---

#### updateMicrodeposit

<details>
 <summary><code>POST</code> <code><b>/microdeposits/{microdeposit_guid}</b></code> <code>(creates a manual account)</code></summary>

##### Parameters

##### Parameters

> | name             | type     | data type | description |
> | ---------------- | -------- | --------- | ----------- |
> | `account_name`   | optional | string    |             |
> | `account_number` | optional | string    |             |
> | `account_type`   | optional | number    |             |
> | `user_guid`      | optional | string    |             |
> | `email`          | optional | string    |             |
> | `first_name`     | optional | string    |             |
> | `last_name`      | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X PUT -H "Content-Type: application/json" --data @post.json http://localhost:8889/microdeposits/{microdeposit_guid}
> ```

</details>

---

#### refreshMicrodepositStatus

<details>
 <summary><code>GET</code> <code><b>/microdeposits/{microdeposit_guid}/status</b></code> <code>(refresh a specific microdeposit)</code></summary>

##### Parameters

> | name                | type     | data type | description |
> | ------------------- | -------- | --------- | ----------- |
> | `microdeposit_guid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/microdeposits/{microdeposit_guid}/status
> ```

</details>

---

#### verifyMicrodeposit

<details>
 <summary><code>PUT</code> <code><b>/microdeposits/{microdeposit_guid}/verify</b></code> <code>(refresh a specific microdeposit)</code></summary>

##### Parameters

> | name                | type     | data type | description |
> | ------------------- | -------- | --------- | ----------- |
> | `microdeposit_guid` | optional | string    |             |
> | `deposit_amount_1`  | optional | number    |             |
> | `deposit_amount_2`  | optional | number    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X PUT -H "Content-Type: application/json" --data @post.json http://localhost:8889/microdeposits/{microdeposit_guid}/verify
> ```

</details>

---

#### verifyRoutingNumber

<details>
 <summary><code>GET</code> <code><b>/microdeposits/{microdeposit_guid}{routing_number}/b></code> <code>(refresh a specific microdeposit)</code></summary>

##### Parameters

> | name                                | type     | data type | description |
> | ----------------------------------- | -------- | --------- | ----------- |
> | `routing_number`                    | optional | string    |             |
> | `account_identification_is_enabled` | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                     |
> | --------- | ------------------ | ---------------------------------------------------------------------------- |
> | `200`     | `application/json` | `blockedRoutingNumber: {guid: null,reason: 3, reason_name: "IAV_PREFERRED"}` |

> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X GET -H "Content-Type: application/json" --data @post.json http://localhost:8889/microdeposits/{routing_number}
> ```

</details>

---
