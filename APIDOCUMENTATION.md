## API Documentation

#### addMember(memberData, config , isHuman)

<details>
 <summary>Creates a new institution member</summary>

##### Parameters

> | name         | type     | data type                                              | description                                                                                                                                                                                                                                 |
> | ------------ | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `memberData` | required | object                                                 | The connect widget will need the correct type of credential required by the financial institution, with values provided by the end user. [More details](https://docs.mx.com/api-reference/atrium/reference/members/overview/#member-fields) |
> | `config`     | required | [`configType`](./src/redux/reducers/configSlice.ts#L7) | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./docs/CLIENT_CONFIG.md)                                                                                                             |
> | `isHuman`    | optional | boolean                                                | NA                                                                                                                                                                                                                                          |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}}` |
>
> <<<<<<< HEAD
> | `400` | `application/json` |
> =======
> | `400` | `application/json` | |

##### Example cURL

> ```javascript
>  curl -X POST -H "Content-Type: application/json" --data @post.json http://localhost:8889/
> ```
>
> > > > > > > ac71a1d9e5 (completed member endpoints)

</details>

---

#### updateMember(memberData, config , isHuman)

<details>
 <summary>Updates institution member</summary>

##### Parameters

> | name         | type     | data type                                              | description                                                                                                                                                                                                                                 |
> | ------------ | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `memberData` | required | object                                                 | The connect widget will need the correct type of credential required by the financial institution, with values provided by the end user. [More details](https://docs.mx.com/api-reference/atrium/reference/members/overview/#member-fields) |
> | `config`     | required | [`configType`](./src/redux/reducers/configSlice.ts#L7) | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./docs/CLIENT_CONFIG.md)                                                                                                             |
> | `isHuman`    | optional | boolean                                                | NA                                                                                                                                                                                                                                          |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}}` |
> | `400`     | `application/json` |

</details>

---

#### updateMFA(memberData, config , isHuman)

<details>
 <summary>Updates MFA for a member</summary>

##### Parameters

> | name         | type     | data type                                              | description                                                                                                                                                                                                                                 |
> | ------------ | -------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `memberData` | required | object                                                 | The connect widget will need the correct type of credential required by the financial institution, with values provided by the end user. [More details](https://docs.mx.com/api-reference/atrium/reference/members/overview/#member-fields) |
> | `config`     | required | [`configType`](./src/redux/reducers/configSlice.ts#L7) | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./docs/CLIENT_CONFIG.md)                                                                                                             |
> | `isHuman`    | optional | boolean                                                | NA                                                                                                                                                                                                                                          |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}}` |
> | `400`     | `application/json` |

</details>

---

#### deleteMember(member)

<details>
  <summary>Deletes member by its guid</summary>

##### Parameters

> | name          | type     | data type | description                           |
> | ------------- | -------- | --------- | ------------------------------------- |
> | `member.guid` | required | string    | The specific member unique idendifier |

##### Responses

> | http code | content-type       | response |
> | --------- | ------------------ | -------- |
> | `200`     | `application/json` |          |
> | `400`     | `application/json` |          |

</details>

---

#### loadMembers()

<details>
 <summary>Returns an array of members associated with a specific user</code></summary>

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"members": [{ "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}]}` |
> | `400`     | `application/json` |

</details>

---

#### loadMemberByGuid(memberGuid)

<details>
 <summary>Returns a specific member by its guid</code></summary>

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{"member": { "aggregated_at": "2016-10-13T18:07:57.000Z","background_aggregation_is_disabled": false"connection_status":"CONNECTED","guid": "MBR-7c6f361b-e582-15b6-60c0-358f12466b4b","id": "unique_id","institution_code": "mxbank","is_being_aggregated": false,"is_managed_by_user": false,"is_manual": false,"is_oauth": false,"metadata": "\\\"credentials_last_refreshed_at\\\": \\\"2015-10-15\\\"","most_recent_job_detail_code": null,"most_recent_job_detail_text": "","name": "MX Bank","oauth_window_uri": "https://mxbank.mx.com/oauth/authorize?client_id=b8OikQ4Ep3NuSUrQ13DdvFuwpNx-qqoAsJDVAQCyLkQ&redirect_uri=https%3A%2F%2Fint-app.moneydesktop.com%2Foauth%2Fredirect_from&response_type=code&scope=openid&state=d745bd4ee6f0f9c184757f574bcc2df2""successfully_aggregated_at": "2016-10-13T17:57:38.000Z","user_guid": "USR-fa7537f3-48aa-a683-a02a-b18940482f54","user_id": "user123"}}` |
> | `400`     | `application/json` |

</details>

---

#### loadOAuthStates(queryObject)

<details>
 <summary>Returns an array of OAuth States</summary>

##### Parameters

> | name                               | type     | data type | description |
> | ---------------------------------- | -------- | --------- | ----------- |
> | `queryObject.outbound_member_guid` | optional | string    |             |
> | `queryObject.oauth_status`         | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                      |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `[{ "guid": "OAS-1","auth_status": 1,"created_at": "2023-07-27T20:13:44+00:00","error_reason": null,"first_retrieved_at": null, "inbound_member_guid": null,"outbound_member_guid": "MBR-1","updated_at": "2023-07-27T20:13:44+00:00","user_guid": "USR-1"}]` |

> | `400` | `application/json` | |

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

> | `400` | `application/json` | |

</details>

---

#### createSupportTicket(ticket)

<details>
 <summary>Creates a ticket for the support team</code></summary>

##### Parameters

> | name             | type     | data type | description |
> | ---------------- | -------- | --------- | ----------- |
> | `ticket.email`   | optional | string    |             |
> | `ticket.tittle`  | optional | string    |             |
> | `ticket.message` | optional | string    |             |

##### Responses

> | http code | content-type       | response |
> | --------- | ------------------ | -------- |
> | `200`     | `application/json` |          |

> | `400` | `application/json` | |

</details>

---

#### loadInstitutions(query)

<details>
 <summary>Returns an array of institutions</code></summary>

##### Parameters

> | name                                      | type     | data type | description |
> | ----------------------------------------- | -------- | --------- | ----------- |
> | `query.search_name`                       | optional | string    |             |
> | `query.routing_number`                    | optional | string    |             |
> | `query.page`                              | optional | number    |             |
> | `query.per_page`                          | optional | number    |             |
> | `query.account_verification_is_enabled`   | optional | boolean   |             |
> | `query.account_identification_is_enabled` | optional | boolean   |             |
> | `query.tax_statement_is_enabled`          | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `[{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}]` |

> | `400` | `application/json` | |

</details>

---

#### loadInstitutionByGuid(guid)

<details>
 <summary>Returns an institution by its guid</summary>

##### Parameters

> | name   | type     | data type | description |
> | ------ | -------- | --------- | ----------- |
> | `guid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
> | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}` |

> | `400` | `application/json` | |

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

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
> | --------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}` |

> | `400` | `application/json` | |

</details>

---

#### loadPopularInstitutions(query)

<details>
 <summary>Returns popular institutions</code></summary>

##### Parameters

> | name                                      | type     | data type | description |
> | ----------------------------------------- | -------- | --------- | ----------- |
> | `query.per_page`                          | optional | number    |             |
> | `query.account_verification_is_enabled`   | optional | boolean   |             |
> | `query.account_identification_is_enabled` | optional | boolean   |             |
> | `query.tax_statement_is_enabled`          | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
> | --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `[{account_verification_is_enabled: true,code: "gringotts",forgot_password_credential_recovery_url: "https://mx.com/forgot_password", forgot_username_credential_recovery_url: null,guid: "INS-f1a3285d-e855-b68f-6aa7-8ae775c0e0e9",login_url: null, name: "Gringotts", popularity: 32685,supports_oauth: false,tax_statement_is_enabled: false,trouble_signing_credential_recovery_url: "https://mx.com/forgot_password",url: "https://gringotts.sand.internal.mx"}]` |

> | `400` | `application/json` | |

</details>

---

#### loadDiscoveredInstitutions()

<details>
 <summary>Returns discovered institutions</summary>

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

</details>

---

#### createAccount(account)

<details>
 <summary>Creates a manual account</summary>

##### Parameters

> | name                    | type     | data type | description |
> | ----------------------- | -------- | --------- | ----------- |
> | `account.account_type`  | optional | string    |             |
> | `account.balance`       | optional | number    |             |
> | `account.interest_rate` | optional | number    |             |
> | `account.is_personal`   | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                         |
> | --------- | ------------------ | ------------------------------------------------ |
> | `200`     | `application/json` | `{"guid": "ACC-123","account_type": "CHECKING"}` |

> | `400` | `application/json` | |

</details>

---

#### createMicrodeposit(microdeposit)

<details>
 <summary>Creates a new microdeposit</summary>

##### Parameters

> | name                          | type     | data type | description |
> | ----------------------------- | -------- | --------- | ----------- |
> | `microdeposit.account_name`   | optional | string    |             |
> | `microdeposit.account_number` | optional | string    |             |
> | `microdeposit.account_type`   | optional | number    |             |
> | `microdeposit.user_guid`      | optional | string    |             |
> | `microdeposit.email`          | optional | string    |             |
> | `microdeposit.first_name`     | optional | string    |             |
> | `microdeposit.last_name`      | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

</details>

---

#### loadMicrodepositByGuid(microdepositGuid)

<details>
 <summary>Returns a specific microdeposit by its guid</code></summary>

##### Parameters

> | name               | type     | data type | description |
> | ------------------ | -------- | --------- | ----------- |
> | `microdepositGuid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

</details>

---

#### updateMicrodeposit(microdepositGuid, updatedData)

<details>
 <summary>Updates a microdeposit</summary>

##### Parameters

##### Parameters

> | name                         | type     | data type | description |
> | ---------------------------- | -------- | --------- | ----------- |
> | `microdepositGuid`           | optional | string    |             |
> | `updatedData.account_name`   | optional | string    |             |
> | `updatedData.account_number` | optional | string    |             |
> | `updatedData.account_type`   | optional | number    |             |
> | `updatedData.user_guid`      | optional | string    |             |
> | `updatedData.email`          | optional | string    |             |
> | `updatedData.first_name`     | optional | string    |             |
> | `updatedData.last_name`      | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

</details>

---

#### refreshMicrodepositStatus(microdepositGuid)

<details>
 <summary>Refresh a specific microdeposit</summary>

##### Parameters

> | name               | type     | data type | description |
> | ------------------ | -------- | --------- | ----------- |
> | `microdepositGuid` | optional | string    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

</details>

---

#### verifyMicrodeposit(microdepositGuid, amountData)

<details>
 <summary>Verify a specific microdeposit</summary>

##### Parameters

> | name                          | type     | data type | description |
> | ----------------------------- | -------- | --------- | ----------- |
> | `microdepositGuid`            | optional | string    |             |
> | `amountData.deposit_amount_1` | optional | number    |             |
> | `amountData.deposit_amount_2` | optional | number    |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                                                                             |
> | --------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `200`     | `application/json` | `{ account_name: 'Test Checking',account_number: '123456789',account_type: 1,can_auto_verify: false,deposit_expected_at: '2023-04-13T09:00:00+00:00,email: 'test@test.com', first_name: 'First',guid: 'MIC-123',last_name: 'Last', routing_number: '123456789',status : 0,status_name: 'INITIATED',updated_at: '1681151550',user_guid: 'USR-123', }` |

> | `400` | `application/json` | |

</details>

---

#### verifyRoutingNumber(routingNumber, accountIdentificationEnabled)

<details>
 <summary>Verify a routing number</summary>

##### Parameters

> | name                           | type     | data type | description |
> | ------------------------------ | -------- | --------- | ----------- |
> | `routingNumber`                | optional | string    |             |
> | `accountIdentificationEnabled` | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                     |
> | --------- | ------------------ | ---------------------------------------------------------------------------- |
> | `200`     | `application/json` | `blockedRoutingNumber: {guid: null,reason: 3, reason_name: "IAV_PREFERRED"}` |

> | `400` | `application/json` | |

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

> | `400` | `application/json` | |

</details>

---

#### runJob(jobType, memberGuid, connectConfig, isHuman)

<details>
 <summary>Runs a specific job as depicted by the job_type</summary>

##### Parameters

> | name                                 | type     | data type | description                                                                                                                                                         |
> | ------------------------------------ | -------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
> | `jobType`                            | required | number    | `AGGREGATION: 0,VERIFICATION: 1, IDENTIFICATION: 2,HISTORY: 3,STATEMENT: 4,ORDER: 5,REWARD: 6,BALANCE: 7,MICRO_DEPOSIT: 8,TAX: 9,CREDIT_REPORT: 10,COMBINATION: 11` |
> | `member_guid`                        | optional | string    |                                                                                                                                                                     |
> | `connectConfig.include_transactions` | optional | boolean   |                                                                                                                                                                     |
> | `isHuman`                            | optional | boolean   |

##### Responses

> | http code | content-type       | response                            |
> | --------- | ------------------ | ----------------------------------- |
> | `200`     | `application/json` | `{"job_guid": "MBR-1","status": 6}` |

> | `400` | `application/json` | |

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

> | `400` | `application/json` | |

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

> | `400` | `application/json` |

</details>

---

#### getOAuthWindowURI(memberGuid, appConfig, connectConfig)

<details>
 <summary>Returns OAuth window URI</summary>

##### Parameters

> | name                                      | type     | data type | description |
> | ----------------------------------------- | -------- | --------- | ----------- |
> | `memberGuid`                              | optional | string    |             |
> | `appConfig.is_mobile_webview`             | optional | boolean   |             |
> | `appConfig.ui_message_webview_url_scheme` | optional | string    |             |
> | `connectConfig.client_redirect_url`       | optional | string    |             |
> | `connectConfig.oauth_referral_source`     | optional | string    |             |
> | `connectConfig.enable_app2app`            | optional | boolean   |             |

##### Responses

> | http code | content-type       | response                                                                                                                                                                                                                                                                                         |
> | --------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
> | `200`     | `application/json` | `{guid: "MBR-123",oauth_window_uri: "https://banksy.kube.sand.internal.mx/oauth/authorize?client_id=QNxNCdUN5pjVdjPk1HKWRsGO2DE_EOaHutrXHZGp2KI&redirect_uri=https%3A%2F%2Fapp.sand.internal.mx%2Foauth%2Fredirect_from&response_type=code&scope=read&state=30b10bf99b063b8b0caee61ec42d3cd8" }` |

> | `400` | `application/json` |

</details>

---
