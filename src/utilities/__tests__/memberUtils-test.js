// import { ReadableAccountTypes } from 'src/const/Accounts'
// import { VERIFY_MODE } from 'src/const/Connect'
// import { ReadableStatuses } from 'src/const/Statuses'
// import { JOB_DETAIL_CODE } from 'src/const/jobDetailCode'
// import { hasNoSingleAccountSelectOptions, hasNoVerifiableAccounts } from 'src/utilities/memberUtils'

// describe('memberUtils Tests', () => {
//   describe('hasNoVerifiableAccounts', () => {
//     it('returns true when the NO_VERIFIABLE_ACCOUNTS error code is present', () => {
//       const MEMBER_GUID = 'MBR-1'
//       const member = {
//         guid: MEMBER_GUID,
//         most_recent_job_detail_code: JOB_DETAIL_CODE.NO_VERIFIABLE_ACCOUNTS,
//       }
//       const config = { mode: VERIFY_MODE }
//       const accounts = [
//         { member_guid: MEMBER_GUID, account_type: ReadableAccountTypes.CREDIT_CARD },
//       ]

//       const result = hasNoVerifiableAccounts(member, config, accounts)

//       expect(result).toEqual(true)
//     })

//     it('returns false with no error code', () => {
//       const MEMBER_GUID = 'MBR-1'
//       const member = {
//         guid: MEMBER_GUID,
//         most_recent_job_detail_code: null,
//       }
//       const config = { mode: VERIFY_MODE }
//       const accounts = []

//       const result = hasNoVerifiableAccounts(member, config, accounts)

//       expect(result).toEqual(false)
//     })
//   })

//   describe('hasNoSingleAccountSelectOptions', () => {
//     const SAS_EXTERNAL_ID = 'single_account_select'
//     it('returns true when CHALLENGED, it is SAS, and there are no options', () => {
//       const member = {
//         connection_status: ReadableStatuses.CHALLENGED,
//         mfa: {
//           credentials: [
//             {
//               external_id: SAS_EXTERNAL_ID,
//               options: [],
//             },
//           ],
//         },
//       }
//       const result = hasNoSingleAccountSelectOptions(member)
//       expect(result).toEqual(true)
//     })

//     // QUESTION - should this enforce account type?
//     it('returns false when CHALLENGED, it is SAS, and there are account options', () => {
//       const member = {
//         connection_status: ReadableStatuses.CHALLENGED,
//         mfa: {
//           credentials: [
//             {
//               external_id: SAS_EXTERNAL_ID,
//               options: [
//                 {
//                   guid: 'ACT-1',
//                 },
//                 {
//                   guid: 'ACT-2',
//                 },
//               ],
//             },
//           ],
//         },
//       }
//       const result = hasNoSingleAccountSelectOptions(member)
//       expect(result).toEqual(false)
//     })
//   })
// })
