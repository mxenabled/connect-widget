import React from 'react'
import { createTestReduxStore, render, screen, waitFor, within } from 'src/utilities/testingLibrary'
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
      } as PostMessageEventOverrides

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
      } as PostMessageEventOverrides

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

  describe('powered by', () => {
    it('renders powered by MX if there is no aggregatorDisplayName', async () => {
      const store = createTestReduxStore({
        connect: {
          location: [],
          jobSchedule: {
            isInitialized: true,
            jobs: [
              {
                type: 'aggregate',
                status: 'active',
                guid: 'job-1',
              },
            ],
          },
          members: [],
        },
      })

      render(
        <Connecting connectConfig={{}} institution={{ guid: 'inst-guid', logo_url: 'inst.png' }} />,
        { store },
      )

      expect(within(screen.getByText(/powered by/)).getByText('MX')).toBeInTheDocument()
    })

    it('renders powered by with the aggregatorDisplayName if provided', async () => {
      const store = createTestReduxStore({
        connect: {
          location: [],
          jobSchedule: {
            isInitialized: true,
            jobs: [
              {
                type: 'aggregate',
                status: 'active',
                guid: 'job-1',
              },
            ],
          },
          members: [],
        },
      })

      render(
        <Connecting
          connectConfig={{}}
          institution={{
            aggregatorDisplayName: 'Aggregator Name',
            guid: 'inst-guid',
            logo_url: 'inst.png',
          }}
        />,
        { store },
      )

      expect(
        within(screen.getByText(/powered by/)).getByText('Aggregator Name'),
      ).toBeInTheDocument()
    })
  })

  describe('ProgressBar', () => {
    describe('when job schedule is not initialized', () => {
      it('shows a loading spinner', async () => {
        const store = createTestReduxStore({
          connect: {
            location: [],
            jobSchedule: {
              isInitialized: false,
              jobs: [],
            },
            members: [],
          },
        })

        const { container } = render(
          <Connecting
            connectConfig={{}}
            institution={{ guid: 'test-guid', logo_url: 'test.png' }}
          />,
          { store },
        )

        // Should show a spinner when job schedule is not initialized
        await waitFor(() => {
          // Look for the spinner container div with center alignment
          const spinnerContainer = container.querySelector('[style*="text-align: center"]')
          expect(spinnerContainer).toBeInTheDocument()
        })
      })
    })

    describe('when job schedule is initialized', () => {
      it('renders progress bar with client and institution logos', async () => {
        const store = createTestReduxStore({
          connect: {
            location: [],
            jobSchedule: {
              isInitialized: true,
              jobs: [
                {
                  type: 'aggregate',
                  status: 'active',
                  guid: 'job-1',
                },
              ],
            },
            members: [],
          },
        })

        render(
          <Connecting
            connectConfig={{}}
            institution={{ guid: 'inst-guid', logo_url: 'inst.png' }}
          />,
          { store },
        )
        await waitFor(() => {
          const progressElements = document.querySelectorAll('[style*="height: 2px"]')
          expect(progressElements.length).toBeGreaterThan(0)
        })
      })

      it('shows active job with spinner when job is active', async () => {
        const store = createTestReduxStore({
          connect: {
            location: [],
            jobSchedule: {
              isInitialized: true,
              jobs: [
                {
                  type: 'aggregate',
                  status: 'active',
                  guid: 'job-1',
                },
              ],
            },
            members: [],
          },
        })

        const { container } = render(
          <Connecting
            connectConfig={{}}
            institution={{ guid: 'inst-guid', logo_url: 'inst.png' }}
          />,
          { store },
        )

        await waitFor(() => {
          const activeElements = container.querySelectorAll('[style*="border-color"]')
          expect(activeElements.length).toBeGreaterThan(0)
        })
      })

      it('shows checkmarks when jobs are done', async () => {
        const store = createTestReduxStore({
          connect: {
            location: [],
            jobSchedule: {
              isInitialized: true,
              jobs: [
                {
                  type: 'aggregate',
                  status: 'done',
                  guid: 'job-1',
                },
                {
                  type: 'identify',
                  status: 'done',
                  guid: 'job-2',
                },
              ],
            },
            members: [],
          },
        })

        render(
          <Connecting
            connectConfig={{}}
            institution={{ guid: 'inst-guid', logo_url: 'inst.png' }}
          />,
          { store },
        )

        await waitFor(() => {
          const checkmarks = document.querySelectorAll('svg[viewBox="0 -960 960 960"]')
          expect(checkmarks.length).toBeGreaterThan(0)
        })
      })

      it('renders progress message with correct job type', async () => {
        const store = createTestReduxStore({
          connect: {
            location: [],
            jobSchedule: {
              isInitialized: true,
              jobs: [
                {
                  type: 'aggregate',
                  status: 'active',
                  guid: 'job-1',
                },
              ],
            },
            members: [],
          },
        })

        render(
          <Connecting
            connectConfig={{}}
            institution={{ guid: 'inst-guid', logo_url: 'inst.png' }}
          />,
          { store },
        )
        await waitFor(() => {
          const messageElement = document.querySelector('p')
          expect(messageElement).toBeInTheDocument()
        })
      })
    })
  })
})
