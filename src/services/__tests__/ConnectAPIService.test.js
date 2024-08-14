// import { FireflyDataSource } from 'src/services/FireflyDataSource'
// import { ConnectAPIService } from 'src/services/ConnectAPIService'
// import { JOB_TYPES } from 'src/const/consts'

// // FireflyDataSource expects an axios instance, so lets mock it and test the function signatures
// jest.mock('src/services/FireflyDataSource')

// let api = null
// beforeEach(() => {
//   api = new ConnectAPIService(new FireflyDataSource(null))
//   FireflyDataSource.mockClear()
// })
// describe('ConnectAPIService tests', () => {
//   it('should call the correct URL', () => {
//     api.loadMaster()
//     expect(api.dataSource.loadMaster).toHaveBeenCalled()
//   })
//   it('can extendSession', () => {
//     api.extendSession()
//     expect(api.dataSource.extendSession).toHaveBeenCalled()
//   })

//   it('can logout', () => {
//     api.logout()
//     expect(api.dataSource.logout).toHaveBeenCalled()
//   })

//   it('can call datasource.instrumentation', () => {
//     const configOptions = {}
//     api.instrumentation(configOptions)
//     expect(api.dataSource.instrumentation).toHaveBeenCalledWith(configOptions)
//   })

//   it('Can addMember', () => {
//     const memberData = {}
//     const connectConfig = {}
//     const appConfig = {}
//     const isHuman = false

//     api.addMember(memberData, connectConfig, appConfig, isHuman)

//     expect(api.dataSource.addMember).toHaveBeenCalledWith(
//       memberData,
//       connectConfig,
//       appConfig,
//       false,
//     )
//   })

//   it('Can updateMember', () => {
//     const member = { guid: '123' }
//     const connectConfig = {}
//     const isHuman = false

//     api.updateMember(member, connectConfig, isHuman)

//     expect(api.dataSource.updateMember).toHaveBeenCalledWith(member, connectConfig, isHuman)
//   })

//   it('Can call datasource.loadMembers', () => {
//     api.loadMembers()
//     expect(api.dataSource.loadMembers).toHaveBeenCalled()
//   })

//   it('can call datasource.loadOAuthStates', () => {
//     const query = {}

//     api.loadOAuthStates(query)
//     expect(api.dataSource.loadOAuthStates).toHaveBeenCalledWith(query)
//   })

//   it('can call datasource.loadOAuthState', () => {
//     const oauthGuid = 'OAS-123'

//     api.loadOAuthState(oauthGuid)
//     expect(api.dataSource.loadOAuthState).toHaveBeenCalledWith(oauthGuid)
//   })

//   it('Can call datasource.loadMemberByGuid', () => {
//     const guid = 'MBR123'

//     api.loadMemberByGuid(guid)
//     expect(api.dataSource.loadMemberByGuid).toHaveBeenCalledWith(guid)
//   })

//   it('Can createMicrodeposit', () => {
//     const microdeposit = {}
//     api.createMicrodeposit(microdeposit)

//     expect(api.dataSource.createMicrodeposit).toHaveBeenCalledWith(microdeposit)
//   })

//   it('Can loadMicrodepoitByGuid', () => {
//     const microdepositGuid = 'MIC-123'
//     api.loadMicrodepositByGuid(microdepositGuid)

//     expect(api.dataSource.loadMicrodepositByGuid).toHaveBeenCalledWith(microdepositGuid)
//   })

//   it('Can updateMicrodeposit', () => {
//     const microdepositGuid = 'MIC-123'
//     const updatedData = {}
//     api.updateMicrodeposit(microdepositGuid, updatedData)

//     expect(api.dataSource.updateMicrodeposit).toHaveBeenCalledWith(microdepositGuid, updatedData)
//   })

//   it('Can refreshMicrodepositStatus', () => {
//     const microdepositGuid = 'MIC-123'
//     api.refreshMicrodepositStatus(microdepositGuid)

//     expect(api.dataSource.refreshMicrodepositStatus).toHaveBeenCalledWith(microdepositGuid)
//   })

//   it('Can verifyMicrodeposit', () => {
//     const microdepositGuid = 'MIC-123'
//     const amountData = {}
//     api.verifyMicrodeposit(microdepositGuid, amountData)

//     expect(api.dataSource.verifyMicrodeposit).toHaveBeenCalledWith(microdepositGuid, amountData)
//   })

//   it('can verifyRoutingNumber', () => {
//     const routingNumber = '123456789'
//     api.verifyRoutingNumber(routingNumber, true)

//     expect(api.dataSource.verifyRoutingNumber).toHaveBeenCalledWith(routingNumber, true)
//   })

//   it('Can submitConnectFeedback', () => {
//     const feedback = { foo: 'bar' }

//     api.submitConnectFeedback(feedback)

//     expect(api.dataSource.submitConnectFeedback).toHaveBeenCalledWith(feedback)
//   })

//   it('Can createSupportTicket', () => {
//     const ticket = { foo: 'bar' }

//     api.createSupportTicket(ticket)

//     expect(api.dataSource.createSupportTicket).toHaveBeenCalledWith(ticket)
//   })

//   it('Can call datasource.getInstitutionCredentials', () => {
//     const institutionGuid = 'INS-123'

//     api.getInstitutionCredentials(institutionGuid)
//     expect(api.dataSource.getInstitutionCredentials).toHaveBeenCalledWith(institutionGuid)
//   })

//   it('Can call datasource.getMemberCredentials', () => {
//     const memberGuid = 'MBR-123'

//     api.getMemberCredentials(memberGuid)
//     expect(api.dataSource.getMemberCredentials).toHaveBeenCalledWith(memberGuid)
//   })

//   it('Can call datasource.loadJob', () => {
//     const jobGuid = 'JOB-123'

//     api.loadJob(jobGuid)
//     expect(api.dataSource.loadJob).toHaveBeenCalledWith(jobGuid)
//   })

//   it('Can call datasource.runJob', () => {
//     const jobType = JOB_TYPES.AGGREGATION
//     const memberGuid = 'MBR-123'
//     const connectConfig = {}
//     const isHuman = false

//     api.runJob(jobType, memberGuid, connectConfig, isHuman)
//     expect(api.dataSource.runJob).toHaveBeenCalledWith(jobType, memberGuid, connectConfig, isHuman)
//   })

//   it('Can call datasource.getOauthWindowURI', () => {
//     const memberGuid = 'MBR-123'
//     const config = {}
//     const connectConfig = {}

//     api.getOAuthWindowURI(memberGuid, config, connectConfig)
//     expect(api.dataSource.getOAuthWindowURI).toHaveBeenCalledWith(memberGuid, config, connectConfig)
//   })

//   it('can call datasource.createAnalyticsSession', () => {
//     const options = {}
//     api.createAnalyticsSession(options)
//     expect(api.dataSource.createAnalyticsSession).toHaveBeenCalledWith(options)
//   })

//   it('can call datasource.closeAnalyticsSession', () => {
//     const session = {}
//     api.closeAnalyticsSession(session)
//     expect(api.dataSource.closeAnalyticsSession).toHaveBeenCalledWith(session)
//   })

//   it('Can call datasource.loadInstitutions', () => {
//     const query = {}

//     api.loadInstitutions(query)
//     expect(api.dataSource.loadInstitutions).toHaveBeenCalledWith(query)
//   })

//   it('Can call datasource.loadInstitutionByGuid', () => {
//     const institutionGuid = 'INS-123'

//     api.loadInstitutionByGuid(institutionGuid)
//     expect(api.dataSource.loadInstitutionByGuid).toHaveBeenCalledWith(institutionGuid)
//   })

//   it('Can call datasource.loadInstitutionByCode', () => {
//     const code = '1234'

//     api.loadInstitutionByCode(code)
//     expect(api.dataSource.loadInstitutionByCode).toHaveBeenCalledWith(code)
//   })

//   it('Can call datasource.loadPopularInstitutions', () => {
//     const query = {}

//     api.loadPopularInstitutions(query)
//     expect(api.dataSource.loadPopularInstitutions).toHaveBeenCalledWith(query)
//   })

//   it('Can call datasource.loadDiscoveredInstitutions', () => {
//     api.loadDiscoveredInstitutions()
//     expect(api.dataSource.loadDiscoveredInstitutions).toHaveBeenCalled()
//   })

//   it('Can call datasource.createAccount', () => {
//     const account = { name: 'Test Account', type: 'CHECKING' }

//     api.createAccount(account)
//     expect(api.dataSource.createAccount).toHaveBeenCalledWith(account)
//   })

//   it('Can call datasource.loadAccounts', () => {
//     api.loadAccounts()
//     expect(api.dataSource.loadAccounts).toHaveBeenCalled()
//   })

//   it('Can call datasource.loadAccountsAndMembers', () => {
//     api.loadAccountsAndMembers()
//     expect(api.dataSource.loadAccountsAndMembers).toHaveBeenCalled()
//   })

//   it('Can call datasource.loadAccountsByMember', () => {
//     const memberGuid = 'MBR-123'
//     api.loadAccountsByMember(memberGuid)
//     expect(api.dataSource.loadAccountsByMember).toHaveBeenCalledWith(memberGuid)
//   })

//   it('Can call datasource.mergeAccounts', () => {
//     const accountGuids = ['ACT-123, ACT-456']
//     api.mergeAccounts(accountGuids)
//     expect(api.dataSource.mergeAccounts).toHaveBeenCalledWith(accountGuids)
//   })

//   it('can call datasource.saveAccount', () => {
//     const account = {}
//     api.saveAccount(account)
//     expect(api.dataSource.saveAccount).toHaveBeenCalledWith(account)
//   })

//   it('can call datasource.updateUserProfile', () => {
//     const userProfile = {}
//     api.updateUserProfile(userProfile)
//     expect(api.dataSource.updateUserProfile).toHaveBeenCalledWith(userProfile)
//   })
// })
