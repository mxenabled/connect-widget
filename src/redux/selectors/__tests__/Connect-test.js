import { genMember } from 'src/utilities/generators/Members'
import {
  getCurrentMember,
  getMembers,
  getSelectedInstitution,
  getSelectedInstitutionUcpInstitutionId,
} from '../Connect'
import { ReadableStatuses } from 'src/const/Statuses'

const ucpInstitutionId = 'testUcpInstitutionId'

const stateWithASelectedInstitution = {
  connect: {
    selectedInstitution: {
      ucpInstitutionId,
    },
  },
}

describe('Connect Selectors', () => {
  describe('getCurrentMember', () => {
    it('should return the current member based on items and current guid', () => {
      const state = {
        connect: {
          currentMemberGuid: 'MBR-1',
          members: [genMember({ guid: 'MBR-1' }), genMember({ guid: 'MBR-2' })],
        },
      }
      const currentMember = getCurrentMember(state)

      expect(currentMember.guid).toEqual('MBR-1')
    })
  })

  describe('getMembers', () => {
    it("returns an empty array if members doesn't exist", () => {
      const state = {
        connect: {},
      }

      expect(getMembers(state)).toEqual([])
    })

    it("returns any members that aren't pending", () => {
      const memberThatIsPending = genMember({
        connection_status: ReadableStatuses.PENDING,
      })
      const memberThatIsntPending = genMember({
        connection_status: ReadableStatuses.CHALLENGED,
      })

      const state = {
        connect: {
          members: [memberThatIsPending, memberThatIsntPending],
        },
      }

      expect(getMembers(state)).toEqual([memberThatIsntPending])
    })
  })

  describe('getSelectedInstitution', () => {
    it('returns the selected institution', () => {
      expect(getSelectedInstitution(stateWithASelectedInstitution)).toEqual(
        stateWithASelectedInstitution.connect.selectedInstitution,
      )
    })
  })

  describe('getSelectedInstitutionUcpInstitutionId', () => {
    it("returns the selected institution's ucpId", () => {
      expect(getSelectedInstitutionUcpInstitutionId(stateWithASelectedInstitution)).toEqual(
        ucpInstitutionId,
      )
    })
  })
})
