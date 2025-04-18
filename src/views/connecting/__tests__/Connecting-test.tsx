import React from 'react'
import { createTestReduxStore, render, waitFor } from 'src/utilities/testingLibrary'
import { Connecting } from '../Connecting'
import { PostMessageContext } from 'src/ConnectWidget'
import { ApiContextTypes, ApiProvider } from 'src/context/ApiContext'
import { POST_MESSAGES } from 'src/const/postMessages'

describe('<Connecting />', () => {
  describe('memberStatusUpdate', () => {
    it('fires the override memberStatusUpdated event', async () => {
      const onPostMessage = vi.fn()

      const testPostMessageEvent = {
        test: 'value',
      }

      const api = {
        loadMemberByGuid: async () => {
          return {
            guid: 'loadMemberGuid',
            postMessageEventData: {
              memberStatusUpdate: testPostMessageEvent,
            },
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
          expect(onPostMessage).toHaveBeenCalledWith(
            'connect/memberStatusUpdate',
            testPostMessageEvent,
          ),
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

    it('fires the override memberConnected event', async () => {
      const onPostMessage = vi.fn()

      const guid = 'loadMemberGuid'
      const user_guid = 'userGuid'

      const testPostMessageEvent = {
        test: 'value',
      }

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
              postMessageEventData: {
                memberConnected: testPostMessageEvent,
              },
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
        expect(onPostMessage).toHaveBeenCalledWith(
          POST_MESSAGES.MEMBER_CONNECTED,
          testPostMessageEvent,
        ),
      )
    })
  })
})
