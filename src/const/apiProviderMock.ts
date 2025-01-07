import { ApiContextTypes } from 'src/context/ApiContext'
import {
  FAVORITE_INSTITUTIONS,
  institutionCredentialsData,
  institutionData,
  JOB_DATA,
  member,
  memberCredentialsData,
  OAUTH_STATE,
  oauth_window_uri,
  SEARCHED_INSTITUTIONS,
} from 'src/services/mockedData'
export const apiValue: ApiContextTypes = {
  addMember: () => Promise.resolve(member),
  deleteMember: () => Promise.resolve(),
  getMemberCredentials: () => Promise.resolve(memberCredentialsData.credentials),
  loadMembers: () => Promise.resolve([member.member]),
  updateMember: () => Promise.resolve(member.member),
  getInstitutionCredentials: () => Promise.resolve(institutionCredentialsData.credentials),
  loadInstitutions: () => Promise.resolve(SEARCHED_INSTITUTIONS),
  loadPopularInstitutions: () => Promise.resolve(FAVORITE_INSTITUTIONS),
  loadInstitutionByGuid: () => Promise.resolve(institutionData.institution),
  updateMFA: () => Promise.resolve(member.member),
  loadJob: () => Promise.resolve(JOB_DATA),
  runJob: () => Promise.resolve(member.member),
  loadOAuthStates: () => Promise.resolve([OAUTH_STATE.oauth_state]),
  loadOAuthState: () => Promise.resolve(OAUTH_STATE.oauth_state),
  getOAuthWindowURI: () => Promise.resolve(oauth_window_uri),
}
