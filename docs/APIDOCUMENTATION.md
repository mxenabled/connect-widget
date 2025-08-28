# [←](../README.md#apiprovider) API Documentation

> **\*All of the callbacks** should return a promise which will resolve to a reponse as described in the response sections.

#### addMember(memberData, config , isHuman)

<details>
 <summary>Creates a new institution member</summary>

##### Parameters

> | name         | type     | data type                                              | description                                                                                                                              |
> | ------------ | -------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
> | `memberData` | required | object                                                 | The connect widget will need the correct type of credential required by the financial institution, with values provided by the end user. |
> | `config`     | required | [`ClientConfigType`](../typings/connectProps.d.ts#L19) | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./CLIENT_CONFIG.md)               |
> | `isHuman`    | optional | boolean                                                | NA                                                                                                                                       |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-123","id": "unique_id","institution_code": "testbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "Test Bank","oauth_window_uri": "https://testbank.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCy&redirect_uri=https%3A%2F%2Ftest.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-123","user_id": "user123"}}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
> | `409`     | `application/json` | `{"response": {"status": 409, "data": {"guid": "MBR-123"}}}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

</details>

---

#### updateMember(memberData, config , isHuman)

<details>
 <summary>Updates institution member</summary>

##### Parameters

> | name         | type     | data type                                              | description                                                                                                                              |
> | ------------ | -------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
> | `memberData` | required | object                                                 | The connect widget will need the correct type of credential required by the financial institution, with values provided by the end user. |
> | `config`     | required | [`ClientConfigType`](../typings/connectProps.d.ts#L19) | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./CLIENT_CONFIG.md)               |
> | `isHuman`    | optional | boolean                                                | NA                                                                                                                                       |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-123","id": "unique_id","institution_code": "testbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "Test Bank","oauth_window_uri": "https://testbank.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCy&redirect_uri=https%3A%2F%2Ftest.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-123","user_id": "user123"}}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": {"guid": "MBR-123", ...}}}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

</details>

---

#### updateMFA(memberData, config , isHuman)

<details>
 <summary>Updates MFA for a member</summary>

##### Parameters

> | name         | type     | data type                                              | description                                                                                                                              |
> | ------------ | -------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
> | `memberData` | required | object                                                 | The connect widget will need the correct type of credential required by the financial institution, with values provided by the end user. |
> | `config`     | required | [`ClientConfigType`](../typings/connectProps.d.ts#L19) | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./CLIENT_CONFIG.md)               |
> | `isHuman`    | optional | boolean                                                | NA                                                                                                                                       |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-123","id": "unique_id","institution_code": "testbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "Test Bank","oauth_window_uri": "https://testbank.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCy&redirect_uri=https%3A%2F%2Ftest.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-123","user_id": "user123"}}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

</details>

---

#### deleteMember(member)

<details>
  <summary>Deletes member by its guid</summary>

##### Parameters

> | name     | type     | data type | description         |
> | -------- | -------- | --------- | ------------------- |
> | `member` | required | string    | The specific member |

##### Responses

> | http code | content-type       | response                                       |
> | --------- | ------------------ | ---------------------------------------------- |
> | `200`     | `application/json` | `{"guid": "MBR-123", ...}`                     |
> | `40#`     | `application/json` | `{"status": 40#, "data": {"guid": "MBR-123"}}` |

</details>

---

#### loadMembers(clientLocale)

<details>
 <summary>Returns an array of members associated with a specific user</code></summary>

##### Parameters

> | name           | type     | data type | description               |
> | -------------- | -------- | --------- | ------------------------- |
> | `clientLocale` | optional | string    | The locale for the widget |

##### Responses

> | http code          | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
> | ------------------ | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `200`              | `application/json` | `{"members": [{ "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED", "error": { "error_code": 1000, "error_message": "Test error message.", "error_type": "MEMBER", "locale": "en", "user_message": "Test user message." }, "guid": "MBR-123","id": "unique_id","institution_code": "testbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "Test Bank","oauth_window_uri": "https://testbank.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCy&redirect_uri=https%3A%2F%2Ftest.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-123","user_id": "user123"}]}` |
> | `40#`              | `application/json` | `{"response": {"status": 40#, "data": {}}}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
> | `VerifyNotEnabled` | `application/json` | `instanceof Error + {"entity_type": "member", "name": "VerifyNotEnabled", "message": "This connection doesn't support verification."}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

</details>

---

#### loadMemberByGuid(memberGuid, clientLocale)

<details>
 <summary>Returns a specific member by its guid</code></summary>

##### Parameters

> | name           | type     | data type | description               |
> | -------------- | -------- | --------- | ------------------------- |
> | `memberGuid`   | required | string    | The specific member guid  |
> | `clientLocale` | optional | string    | The locale for the widget |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
> | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED", "error": { "error_code": 1000, "error_message": "Test error message.", "error_type": "MEMBER", "locale": "en", "user_message": "Test user message." }, "guid": "MBR-123","id": "unique_id","institution_code": "testbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "Test Bank","oauth_window_uri": "https://testbank.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCy&redirect_uri=https%3A%2F%2Ftest.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-123","user_id": "user123"}}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": {"message": "Test message here"}}}`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

</details>

---

#### loadOAuthStates({outbound_member_guid, oauth_status})

<details>
 <summary>Returns an array of OAuth States</summary>

##### Parameters

> | name                   | type     | data type | description |
> | ---------------------- | -------- | --------- | ----------- |
> | `outbound_member_guid` | optional | string    |             |
> | `oauth_status`         | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                      |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `[{ "guid": "OAS-1","auth_status": 1,"created_at": "2023-07-27T20:13:44+00:00","error_reason": null,"first_retrieved_at": null, "inbound_member_guid": null,"outbound_member_guid": "MBR-1","updated_at": "2023-07-27T20:13:44+00:00","user_guid": "USR-1"}]` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}`                                                                                                                                                                                    |

</details>

---

#### loadOAuthState(oauthStateGuid)

<details>
 <summary>Returns a specific OAuthState by its guid</summary>

##### Parameters

> | name             | type     | data type | description |
> | ---------------- | -------- | --------- | ----------- |
> | `oauthStateGuid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                       |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `200`     | `application/json` | `{"oauth_state": { "guid": "OAS-1","auth_status": 1"created_at": "2023-07-31T21:37:22+00:00","error_reason": null,"first_retrieved_at": null,"inbound_member_guid": null,"outbound_member_guid": "MBR-123","updated_at": "2023-07-31T21:37:22+00:00","user_guid": "USR-123"}}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}`                                                                                                                                                                                                     |

</details>

---

#### oAuthStart({ member })

<details>
 <summary>Called when a user clicks an oauth login button</summary>

##### Parameters

> | name     | type     | data type | description |
> | -------- | -------- | --------- | ----------- |
> | `member` | required | object    |             |

##### Responses

> | http code | content-type       | response                                                                   |
> | --------- | ------------------ | -------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{}`                                                                       |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}` |

</details>

---

#### createSupportTicket(ticket)

<details>
 <summary>Creates a ticket for the support team</code></summary>

##### Parameters

> | name     | type     | data type                                           | description |
> | -------- | -------- | --------------------------------------------------- | ----------- |
> | `ticket` | required | [`SupportTicketType`](./typings/apiTypes.d.ts#L261) |             |

##### Responses

> | http code | content-type       | response                                                                   |
> | --------- | ------------------ | -------------------------------------------------------------------------- |
> | `200`     | `application/json` |                                                                            |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}` |

</details>

---

#### loadInstitutions({search_name,routing_number, page, per_page, account_verification_is_enabled,account_identification_is_enabled,tax_statement_is_enabled, iso_country_code })

<details>
 <summary>Returns an array of institutions</code></summary>

##### Parameters

xee

> | name                                | type     | data type | description |
> | ----------------------------------- | -------- | --------- | ----------- |
> | `search_name`                       | optional | string    |             |
> | `routing_number`                    | optional | string    |             |
> | `iso_country_code`                  | optional | string    |             |
> | `page`                              | optional | number    |             |
> | `per_page`                          | optional | number    |             |
> | `account_verification_is_enabled`   | optional | boolean   |             |
> | `account_identification_is_enabled` | optional | boolean   |             |
> | `tax_statement_is_enabled`          | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `200`     | `application/json` | `[{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https:/testbank.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https:/testbank.com/forgot_password",url: "https:/testbank.com"}]` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}`                                                                                                                                                                                                                                                                                                                                                                                         |

</details>

---

#### loadInstitutionByGuid(guid)

<details>
 <summary>Returns an institution by its guid</summary>

##### Parameters

> | name   | type     | data type | description |
> | ------ | -------- | --------- | ----------- |
> | `guid` | required | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https:/testbank.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https:/testbank.com/forgot_password",url: "https:/testbank.com"}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}`                                                                                                                                                                                                                                                                                                                                                                                       |

</details>

---

#### loadInstitutionByCode(code)

<details>
 <summary>Returns an institution by its code</summary>

##### Parameters

> | name   | type     | data type | description      |
> | ------ | -------- | --------- | ---------------- |
> | `code` | optional | string    | institution code |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https:/testbank.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https:/testbank.com/forgot_password",url: "https:/testbank.com"}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}`                                                                                                                                                                                                                                                                                                                                                                                       |

</details>

---

#### loadPopularInstitutions({per_page, account_verification_is_enabled, account_identification_is_enabled, tax_statement_is_enabled, iso_country_code })

<details>
 <summary>Returns popular institutions</code></summary>

##### Parameters

> | name                                | type     | data type | description |
> | ----------------------------------- | -------- | --------- | ----------- |
> | `iso_country_code`                  | optional | string    |             |
> | `per_page`                          | optional | number    |             |
> | `account_verification_is_enabled`   | optional | boolean   |             |
> | `account_identification_is_enabled` | optional | boolean   |             |
> | `tax_statement_is_enabled`          | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `200`     | `application/json` | `[{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https:/testbank.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https:/testbank.com/forgot_password",url: "https:/testbank.com"}]` |
> | `40#`     | `application/json` | `{"response": {"data": {"message": "Test message here"}, "status: 40#}, "config": {"url": "www.test.com/loadPopularInstitutions"}}`                                                                                                                                                                                                                                                                                                                                |

</details>

---

#### loadDiscoveredInstitutions({per_page, account_verification_is_enabled, account_identification_is_enabled, tax_statement_is_enabled, iso_country_code })

<details>
 <summary>Returns discovered institutions</summary>

##### Parameters

> | name                                | type     | data type | description |
> | ----------------------------------- | -------- | --------- | ----------- |
> | `iso_country_code`                  | optional | string    |             |
> | `per_page`                          | optional | number    |             |
> | `account_verification_is_enabled`   | optional | boolean   |             |
> | `account_identification_is_enabled` | optional | boolean   |             |
> | `tax_statement_is_enabled`          | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `200`     | `application/json` | `[{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https:/testbank.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https:/testbank.com/forgot_password",url: "https:/testbank.com"}]` |
> | `40#`     | `application/json` | `{"response": {"data": {"message": "Test message here"}, "status: 40#}, "config": {"url": "www.test.com/loadPopularInstitutions"}}`                                                                                                                                                                                                                                                                                                                                |

</details>

---

#### createAccount(account)

<details>
 <summary>Creates a manual account</summary>

##### Parameters

> | name      | type     | data type                                        | description |
> | --------- | -------- | ------------------------------------------------ | ----------- |
> | `account` | required | [AccountCreateType](../typings/apiTypes.d.ts#L2) |             |

##### Responses

> | http code | content-type       | response                                                                                                                     |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"guid": "ACC-123","account_type": "CHECKING"}`                                                                             |
> | `40#`     | `application/json` | `{ "response": {"data": { "message": "Test message here"}, "status": 40#}, "config": {"url": "www.test.com/createAccount"}}` |

</details>

---

#### createMicrodeposit(microdeposit)

<details>
 <summary>Creates a new microdeposit</summary>

##### Parameters

> | name           | type     | data type                                               | description |
> | -------------- | -------- | ------------------------------------------------------- | ----------- |
> | `microdeposit` | required | [MicrodepositCreateType](../typings/apiTypes.d.ts#L141) |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}`                                                                                                                                                                                                                                                                           |

</details>

---

#### loadMicrodepositByGuid(microdepositGuid)

<details>
 <summary>Returns a specific microdeposit by its guid</code></summary>

##### Parameters

> | name               | type     | data type | description |
> | ------------------ | -------- | --------- | ----------- |
> | `microdepositGuid` | required | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": { "message": "Test message here"}}}`                                                                                                                                                                                                                                                                           |

</details>

---

#### updateMicrodeposit(microdepositGuid, updatedData)

<details>
 <summary>Updates a microdeposit</summary>

##### Parameters

##### Parameters

> | name               | type     | data type                                               | description |
> | ------------------ | -------- | ------------------------------------------------------- | ----------- |
> | `microdepositGuid` | optional | string                                                  |             |
> | `updatedData`      | optional | [MicrodepositUpdateType](../typings/apiTypes.d.ts#L151) |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |
> | `400`     | `application/json` | `{"response": {"status": 40#, "data": { "guid": "MIC-123", ...}}}`                                                                                                                                                                                                                                                                                   |

</details>

---

#### refreshMicrodepositStatus(microdepositGuid)

<details>
 <summary>Refresh a specific microdeposit</summary>

##### Parameters

> | name               | type     | data type | description |
> | ------------------ | -------- | --------- | ----------- |
> | `microdepositGuid` | required | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                                                                                                                                                                                                                                                                                                      |

</details>

---

#### verifyMicrodeposit(microdepositGuid, amountData)

<details>
 <summary>Verify a specific microdeposit</summary>

##### Parameters

> | name               | type     | data type                                               | description |
> | ------------------ | -------- | ------------------------------------------------------- | ----------- |
> | `microdepositGuid` | optional | string                                                  |             |
> | `amountData`       | optional | [MicroDepositVerifyType](../typings/apiTypes.d.ts#L160) |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                                                                                                                                                                                                                                                                                                      |

</details>

---

#### verifyRoutingNumber(routingNumber, includeIdentity)

<details>
 <summary>Verify a routing number</summary>

##### Parameters

> | name              | type     | data type | description |
> | ----------------- | -------- | --------- | ----------- |
> | `routingNumber`   | required | string    |             |
> | `includeIdentity` | required | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                     |
> | --------- | ------------------ | ---------------------------------------------------------------------------- |
> | `200`     | `application/json` | `blockedRoutingNumber: {guid: null,reason: 3, reason_name: "IAV_PREFERRED"}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                              |

</details>

---

#### loadJob(jobGuid)

<details>
 <summary>Returns a job by its guid</summary>

##### Parameters

> | name       | type     | data type | description |
> | ---------- | -------- | --------- | ----------- |
> | `job_guid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                        |
> | --------- | ------------------ | --------------------------------------------------------------- |
> | `200`     | `application/json` | `{guid: "JOB-1",job_type: 0,status: 6,finished_at: 1682356863}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                 |

</details>

---

#### runJob(jobType, memberGuid, config, isHuman)

<details>
 <summary>Runs a specific job as depicted by the job_type</summary>

##### Parameters

> | name          | type     | data type                                              | description                                                                                                                                                         |
> | ------------- | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `jobType`     | required | number                                                 | `AGGREGATION: 0,VERIFICATION: 1, IDENTIFICATION: 2,HISTORY: 3,STATEMENT: 4,ORDER: 5,REWARD: 6,BALANCE: 7,MICRO_DEPOSIT: 8,TAX: 9,CREDIT_REPORT: 10,COMBINATION: 11` |
> | `member_guid` | required | string                                                 |                                                                                                                                                                     |
> | `config`      | required | [`ClientConfigType`](../typings/connectProps.d.ts#L19) | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./CLIENT_CONFIG.md)                                          |
> | `isHuman`     | optional | boolean                                                |

##### Responses

> | http code | content-type       | response                                                                   |
> | --------- | ------------------ | -------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"job_guid": "MBR-1","status": 6}`                                        |
> | `40#`     | `application/json` | `{"response": {"status": 40#, "data": {"message": "Test message here."}}}` |
> | `409`     | `application/json` | `{"response": {"status": 409, "data": {"message": "Test message here."}}}` |

</details>

---

#### getInstitutionCredentials(institutionGuid)

<details>
 <summary>Returns institution credentials</summary>

##### Parameters

> | name              | type     | data type | description |
> | ----------------- | -------- | --------- | ----------- |
> | `institutionGuid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                 |
> | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{credentials: [{display_order: 1,field_name: 'LOGIN', field_type: 3,guid: 'CRD-123',label: 'Username',meta_data: null,optional: false,options: null}]}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                                                                                                          |

</details>

---

#### getMemberCredentials(memberGuid)

<details>
 <summary>Returns member credentials</summary>

##### Parameters

> | name         | type     | data type | description |
> | ------------ | -------- | --------- | ----------- |
> | `memberGuid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                 |
> | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{credentials: [{display_order: 1,field_name: 'LOGIN', field_type: 3,guid: 'CRD-123',label: 'Username',meta_data: null,optional: false,options: null}]}` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                                                                                                          |

</details>

---

#### getOAuthWindowURI(memberGuid, config)

<details>
 <summary>Returns OAuth window URI</summary>

##### Parameters

> | name         | type     | data type                                              | description                                                                                                                |
> | ------------ | -------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
> | `memberGuid` | optional | string                                                 |                                                                                                                            |
> | `config`     | required | [`ClientConfigType`](../typings/connectProps.d.ts#L19) | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./CLIENT_CONFIG.md) |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                              |
> | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{guid: "MBR-123",oauth_window_uri: "https:/testbank.com/oauth/authorize?client_id=QNxNCdUN5pjVdjPk1HKWRsGO2DE_EOaHutrXH&redirect_uri=https%3A%2F%2Fapp.testbank.com%2Foauth%2Fredirect_from&response_type=code&scope=read&state=30b10bf99b063b8b0caee61ec42d3cd8" }` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                                                                                                                                                                                                                       |

</details>

---

#### updateUserProfile(userProfile)

<details>
 <summary>Updates user profile for dismissing too small modal</summary>

##### Parameters

> | name          | type     | data type | description                                                                                                                          |
> | ------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------ |
> | `userProfile` | required | object    | `{userProfile: [UserProfileResponseType](../typings/apiTypes.d.ts#L283), too_small_modal_dismissed_at: "2023-04-13T09:00:00+00:00"}` |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                              |
> | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{guid: "MBR-123",oauth_window_uri: "https:/testbank.com/oauth/authorize?client_id=QNxNCdUN5pjVdjPk1HKWRsGO2DE_EOaHutrXH&redirect_uri=https%3A%2F%2Fapp.testbank.com%2Foauth%2Fredirect_from&response_type=code&scope=read&state=30b10bf99b063b8b0caee61ec42d3cd8" }` |
> | `40#`     | `application/json` | `{"response": {"status": 40#}}`                                                                                                                                                                                                                                       |

</details>

---
