import * as ConnectSelectors from 'src/redux/selectors/Connect'
import { genMember } from 'src/utilities/generators/Members'

describe('Connect Selectors', () => {
  describe('getCurrentMember', () => {
    it('should return the current member based on items and current guid', () => {
      const state = {
        connect: {
          currentMemberGuid: 'MBR-1',
          members: [genMember({ guid: 'MBR-1' }), genMember({ guid: 'MBR-2' })],
        },
      }
      const currentMember = ConnectSelectors.getCurrentMember(state)

      expect(currentMember.guid).toEqual('MBR-1')
    })
  })
})
