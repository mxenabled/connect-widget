import React from 'react'

import { render, screen, waitFor } from 'src/utilities/testingLibrary'
import { useAnalyticsEvent } from 'src/hooks/useAnalyticsEvent'
import { defaultEventMetadata } from 'src/const/Analytics'
import { AnalyticContext } from 'src/Connect'

describe('Analytics Event', () => {
  const onAnalyticEvent = vi.fn()

  describe('useAnalyticsEvent', () => {
    it('should call onAnalyticEvent with the event name prefixed, metadata included and grouped to client', async () => {
      const { user } = render(
        <AnalyticContext.Provider value={{ onAnalyticEvent }}>
          <TestComponent metadata="Metadata value" />
        </AnalyticContext.Provider>,
      )

      const testButton = await screen.findByText('Send Test Event')
      await user.click(testButton)

      await waitFor(() => {
        expect(onAnalyticEvent).toHaveBeenCalledWith('connect_test_event', {
          ...defaultEventMetadata,
          metadataKey: 'Metadata value',
        })
      })
    })
    it('should call onAnalyticEvent with the event name prefixed and grouped to client with no metadata', async () => {
      const { user } = render(
        <AnalyticContext.Provider value={{ onAnalyticEvent }}>
          <TestComponent />
        </AnalyticContext.Provider>,
      )

      const testButton = await screen.findByText('Send Test Event')
      await user.click(testButton)

      await waitFor(() => {
        expect(onAnalyticEvent).toHaveBeenCalledWith('connect_test_event', {
          ...defaultEventMetadata,
        })
      })
    })
  })
})

const TestComponent = ({ metadata }: { metadata?: string }) => {
  const sendEvent = useAnalyticsEvent()

  return (
    <button onClick={() => sendEvent('test_event', metadata && { metadataKey: metadata })}>
      Send Test Event
    </button>
  )
}
