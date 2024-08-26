import React, { ReactElement, useState } from 'react'
import { render, screen } from 'src/utilities/testingLibrary'
import * as analytics from 'src/redux/reducers/analyticsSlice'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

vi.spyOn(analytics, 'addAnalyticPath')
vi.spyOn(analytics, 'removeAnalyticPath')
vi.spyOn(analytics, 'sendAnalyticPath')

const TestSendPathComponent = () => {
  useAnalyticsPath('Send Path Component', '/send-path')
  return <div>Send Path Component</div>
}

const TestAddPathComponent = () => {
  useAnalyticsPath('Add Path Component', '/add-path', {}, false)
  return <div>Add Path Component</div>
}

const TestMetadataComponent = () => {
  useAnalyticsPath('Test Metadata Component', '/send-path-with-meta', { key: 'value' })
  return <div>Test Metadata Component</div>
}

// A test component, which renders a child component that can be unmounted
// when the button is clicked.
const TestUnmountComponent = ({ children }: { children: ReactElement }) => {
  useAnalyticsPath('Fake Component', '/parent')
  const [mounted, setMounted] = useState(true)

  const onUnmount = () => setMounted(false)

  if (mounted) {
    return (
      <div>
        {children}
        <button onClick={onUnmount}>Unmount Me</button>
      </div>
    )
  }

  return <div>unmounted</div>
}

describe('useAnalyticsPath', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })
  describe('sendAnalyticPath', () => {
    it('should add the path when the component mounts', () => {
      render(<TestSendPathComponent />)
      expect(analytics.sendAnalyticPath).toHaveBeenCalledWith({
        path: '/send-path',
        name: 'Send Path Component',
        metadata: {},
      })
    })

    it('should add the metadata if included', () => {
      render(<TestMetadataComponent />)
      expect(analytics.sendAnalyticPath).toHaveBeenCalledWith({
        path: '/send-path-with-meta',
        name: 'Test Metadata Component',
        metadata: { key: 'value' },
      })
    })
  })

  describe('addAnalyticPath', () => {
    it('should add the path when the component mounts with send param false', async () => {
      render(<TestAddPathComponent />)
      expect(await screen.findByText('Add Path Component')).toBeInTheDocument()
      expect(analytics.addAnalyticPath).toHaveBeenCalledWith({
        path: '/add-path',
        name: 'Add Path Component',
      })
    })
  })

  describe('removeAnalyticPath', () => {
    it('should remove the path when the component unmounts', async () => {
      const { user } = render(
        <TestUnmountComponent>
          <TestSendPathComponent />
        </TestUnmountComponent>,
      )
      expect(await screen.findByText('Unmount Me')).toBeInTheDocument()

      // One for /parent, and one for /send-path
      expect(analytics.sendAnalyticPath).toHaveBeenCalledTimes(2)

      await user.click(screen.getByRole('button'))
      expect(analytics.removeAnalyticPath).toHaveBeenCalledWith('/send-path')
    })
  })
})
