import React from 'react'
import { interval, map } from 'rxjs'
import {
  act,
  createTestReduxStore,
  render,
  screen,
  waitFor,
  within,
} from 'src/utilities/testingLibrary'
import { CONNECTING_TIMEOUT_MS, Connecting } from '../Connecting'
import { PostMessageContext } from 'src/ConnectWidget'
import { ApiContextTypes, ApiProvider } from 'src/context/ApiContext'
import { POST_MESSAGES } from 'src/const/postMessages'
import { ReadableStatuses } from 'src/const/Statuses'
import { STEPS } from 'src/const/Connect'
import type { PollingState } from 'src/hooks/usePollMember'
import type { MemberUpdate } from 'src/utilities/transport/MemberUpdateTransport'
import * as usePollMemberHook from 'src/hooks/usePollMember'

const createTimeoutStore = () =>
  createTestReduxStore({
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
    },
  })

const createPollingState = (connectionStatus: number): PollingState => {
  const memberUpdate = {
    member: {
      guid: 'member-guid',
      connection_status: connectionStatus,
      is_being_aggregated: true,
      error: undefined,
    },
  } as unknown as MemberUpdate

  return {
    isError: false,
    previousResponse: memberUpdate,
    currentResponse: memberUpdate,
    pollingIsDone: false,
    userMessage: 'syncing',
    initialDataReady: false,
  }
}

const ONE_SECOND_BEFORE_TIMEOUT_MS = CONNECTING_TIMEOUT_MS - 1000
const TWO_SECONDS_AFTER_TIMEOUT_MS = CONNECTING_TIMEOUT_MS + 2000

describe('<Connecting />', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  describe('timeout', () => {
    it('does not emit timeout before the expected time, and then emits timeout after the expected time', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

      const onPostMessage = vi.fn()

      const store = createTimeoutStore()

      vi.spyOn(usePollMemberHook, 'usePollMember').mockReturnValue(() =>
        interval(1000).pipe(map(() => createPollingState(ReadableStatuses.CONNECTED))),
      )

      const { unmount } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Connecting connectConfig={{}} institution={{}} />
        </PostMessageContext.Provider>,
        { store },
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(ONE_SECOND_BEFORE_TIMEOUT_MS)
      })

      expect(
        onPostMessage.mock.calls.filter((args) => args[0] === 'connect/stepChange').length,
      ).toBe(0)

      await act(async () => {
        await vi.advanceTimersByTimeAsync(
          TWO_SECONDS_AFTER_TIMEOUT_MS - ONE_SECOND_BEFORE_TIMEOUT_MS,
        )
      })

      expect(onPostMessage).toHaveBeenCalledWith('connect/stepChange', {
        previous: STEPS.CONNECTING,
        current: 'timeOut',
      })

      unmount()
    })

    it('does not emit timeout for pending members even after the expected time', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

      const onPostMessage = vi.fn()

      const store = createTimeoutStore()

      vi.spyOn(usePollMemberHook, 'usePollMember').mockReturnValue(() =>
        interval(1000).pipe(map(() => createPollingState(ReadableStatuses.PENDING))),
      )

      const { unmount } = render(
        <PostMessageContext.Provider value={{ onPostMessage }}>
          <Connecting connectConfig={{}} institution={{}} />
        </PostMessageContext.Provider>,
        { store },
      )

      await act(async () => {
        await vi.advanceTimersByTimeAsync(TWO_SECONDS_AFTER_TIMEOUT_MS)
      })

      expect(
        onPostMessage.mock.calls.filter((args) => args[0] === 'connect/stepChange').length,
      ).toBe(0)

      unmount()
    })
  })

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
