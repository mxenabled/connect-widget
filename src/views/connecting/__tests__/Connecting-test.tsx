import React from 'react'
import { createTestReduxStore, render, waitFor } from 'src/utilities/testingLibrary'
import { Connecting } from '../Connecting'
import { PostMessageContext } from 'src/ConnectWidget'
import { ApiContextTypes, ApiProvider } from 'src/context/ApiContext'
import { POST_MESSAGES } from 'src/const/postMessages'

describe('<Connecting />', () => {
  describe('memberStatusUpdate', () => {
    it('fires the override memberStatusUpdated event if it is provided', async () => {
      const onPostMessage = vi.fn()

      const guid = 'loadMemberGuid'
      const testInstitutionId = 'testInstitutionId'

      const postMessageEventOverrides = {
        memberStatusUpdate: {
          getHasStatusChanged: () => true,
          createEventData: ({
            institution,
            member,
          }: {
            institution: {
              testInstitutionId: string
            }
            member: {
              guid: string
            }
          }) => ({
            guid: member.guid,
            testInstitutionId: institution.testInstitutionId,
          }),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      const store = createTestReduxStore({
        connect: {
          location: [],
          jobSchedule: {
            isInitialized: false,
            jobs: [],
          },
          members: [],
          selectedInstitution: {
            testInstitutionId,
          },
        },
      })

      const api = {
        loadMemberByGuid: async () => {
          return {
            guid,
          }
        },
      }

      render(
        <ApiProvider apiValue={api as unknown as ApiContextTypes}>
          <PostMessageContext.Provider value={{ onPostMessage, postMessageEventOverrides }}>
            <Connecting connectConfig={{}} institution={{}} />
          </PostMessageContext.Provider>
        </ApiProvider>,
        { store },
      )

      await waitFor(
        () =>
          expect(onPostMessage).toHaveBeenCalledWith('connect/memberStatusUpdate', {
            guid,
            testInstitutionId,
          }),
        {
          timeout: 10000,
        },
      )
    })

    it('fires the default memberStatusUpdated event', async () => {
      const onPostMessage = vi.fn()

      const guid = 'loadMemberGuid'
      const connection_status = 1

      const api = {
        loadMemberByGuid: async () => {
          return {
            guid,
            connection_status,
          }
        },
      }

      render(
        <ApiProvider apiValue={api as unknown as ApiContextTypes}>
          <PostMessageContext.Provider value={{ onPostMessage }}>
            <Connecting connectConfig={{}} institution={{}} />
          </PostMessageContext.Provider>
        </ApiProvider>,
      )

      await waitFor(
        () =>
          expect(onPostMessage).toHaveBeenCalledWith('connect/memberStatusUpdate', {
            connection_status,
            member_guid: guid,
          }),
        {
          timeout: 10000,
        },
      )
    })
  })

  describe('memberConnected', () => {
    it('fires the default memberConnected event', async () => {
      const onPostMessage = vi.fn()

      const guid = 'loadMemberGuid'
      const user_guid = 'userGuid'

      const store = createTestReduxStore({
        connect: {
          currentMemberGuid: guid,
          jobSchedule: {
            isInitialized: true,
            jobs: [],
          },
          location: [],
          members: [
            {
              guid,
              user_guid,
            },
          ],
        },
      })

      render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Connecting connectConfig={{}} institution={{}} uiMessageVersion={4} />
        </PostMessageContext.Provider>,
        { store },
      )

      await waitFor(() =>
        expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MEMBER_CONNECTED, {
          member_guid: guid,
          user_guid,
        }),
      )
    })

    it('fires the override memberConnected event if it is provided', async () => {
      const onPostMessage = vi.fn()

      const guid = 'loadMemberGuid'

      const postMessageEventOverrides = {
        memberConnected: {
          createEventData: ({
            institution,
            member,
          }: {
            institution: {
              testInstitutionId: string
            }
            member: {
              guid: string
            }
          }) => ({
            guid: member.guid,
            testInstitutionId: institution.testInstitutionId,
          }),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      const testInstitutionId = 'testInstitutionId'

      const store = createTestReduxStore({
        connect: {
          currentMemberGuid: guid,
          jobSchedule: {
            isInitialized: true,
            jobs: [],
          },
          location: [],
          members: [
            {
              guid,
            },
          ],
          selectedInstitution: {
            testInstitutionId,
          },
        },
      })

      render(
        <PostMessageContext.Provider value={{ onPostMessage, postMessageEventOverrides }}>
          <Connecting connectConfig={{}} institution={{}} uiMessageVersion={4} />
        </PostMessageContext.Provider>,
        { store },
      )

      await waitFor(() =>
        expect(onPostMessage).toHaveBeenCalledWith(POST_MESSAGES.MEMBER_CONNECTED, {
          guid,
          testInstitutionId,
        }),
      )
    })
  })
})
