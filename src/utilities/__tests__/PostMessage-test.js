import PostMessage, { getReferrer } from 'src/utilities/PostMessage'
import Store from 'src/redux/Store'

PostMessage.setWebviewUrl = vi.fn()
PostMessage.postMessage = vi.fn()
PostMessage.isInsideIframe = vi.fn(() => true)
PostMessage.getCurrentTime = vi.fn(() => 5)
describe('Post Message Utils', () => {
  describe('send', () => {
    beforeEach(() => {
      PostMessage.setWebviewUrl.mockReset()
      PostMessage.postMessage.mockReset()
    })

    it('should accept ui_message_version as string, convert to integer and still send the message', () => {
      Store.getState = vi.fn().mockReturnValue({
        config: { ui_message_version: '3' },
      })

      PostMessage.send('updated', { type: 'member' })
      expect(PostMessage.postMessage).toHaveBeenCalledWith(
        '{"type":"updated","payload":{"type":"member"},"moneyDesktop":true,"timeStamp":5}',
        'Banana Stand',
      )

      PostMessage.postMessage.mockReset()
      // Now test the ui_message_version is 4
      Store.getState = vi.fn().mockReturnValue({
        config: { ui_message_version: '4' },
      })

      PostMessage.send('updated', { type: 'member' })
      expect(PostMessage.postMessage).not.toHaveBeenCalled()
    })

    it('should set the webview url with a mx message if mx and mobile webview and the ui_message_version is >= 3', () => {
      Store.getState = vi.fn().mockReturnValue({
        profiles: { client: { has_atrium_api: false } },
        config: { is_mobile_webview: true, ui_message_version: 3 },
      })

      PostMessage.send('updated', {
        accounts_count: 3,
        connection_status: 'CONNECTED',
        guid: 'MBR-12345',
        id: 'M-12345',
        institution_guid: 'INS-12345',
        is_manual: false,
        is_user_created: false,
        most_recent_job_guid: 'JOB-12345',
        name: 'Zen Bank',
        type: 'member',
      })
      expect(PostMessage.setWebviewUrl).toHaveBeenCalledWith(
        'mx://memberUpdated?accounts_count=3&connection_status=CONNECTED&guid=MBR-12345&id=M-12345&institution_guid=INS-12345&is_manual=false&is_user_created=false&most_recent_job_guid=JOB-12345&name=Zen Bank&type=member',
      )
    })

    it('should NOT set the webview url with a mx message if mx and master mobile webview and the ui_message_version is < 3', () => {
      Store.getState = vi.fn().mockReturnValue({
        profiles: { client: { has_atrium_api: false } },
        config: { is_mobile_webview: true, ui_message_version: 2 },
      })

      PostMessage.send('updated', {
        accounts_count: 3,
        connection_status: 'CONNECTED',
        guid: 'MBR-12345',
        id: 'M-12345',
        institution_guid: 'INS-12345',
        is_manual: false,
        is_user_created: false,
        most_recent_job_guid: 'JOB-12345',
        name: 'Zen Bank',
        type: 'member',
      })
      expect(PostMessage.setWebviewUrl).not.toHaveBeenCalled()
    })

    it('should not set the webview url with a mx message from an unsupported event', () => {
      Store.getState = vi.fn().mockReturnValue({
        profiles: { client: { has_atrium_api: false } },
        config: { is_mobile_webview: true },
      })

      PostMessage.send('updated', { type: 'goal' })
      expect(PostMessage.setWebviewUrl).not.toHaveBeenCalled()
    })

    it('should send ping events via url change', () => {
      Store.getState().profiles.client.has_atrium_api = false
      Store.getState().config = { is_mobile_webview: true }
      PostMessage.send('ping')
      expect(PostMessage.setWebviewUrl).toHaveBeenCalledWith('mx://ping')
    })

    it('should send ping events via post message', () => {
      PostMessage.isInsideIframe = vi.fn(() => true)
      PostMessage.getCurrentTime = vi.fn(() => 5)
      Store.getState().profiles.client.has_atrium_api = false
      Store.getState().config = {}
      PostMessage.send('ping')

      expect(PostMessage.postMessage).toHaveBeenCalledWith(
        `{"type":"ping","payload":{},"moneyDesktop":true,"timeStamp":5}`,
        'Banana Stand',
      )
    })
  })

  describe('.getReferrer', () => {
    it('should return the window opener location if present', () => {
      window.opener = {
        location: 'Hello Location',
      }
      expect(getReferrer()).toEqual(window.opener.location.toString())
    })

    it('should return the referrer otherwise', () => {
      window.opener = {}

      //This value is set in jest-setup.js
      expect(getReferrer()).toEqual('Banana Stand')
    })
  })

  describe('.parse', () => {
    it('should just return a regular object', () => {
      const data = { name: 'shibby' }
      expect(PostMessage.parse(data)).toEqual(data)
    })

    it('should parse valid json', () => {
      expect(PostMessage.parse('{"key": "val"}')).toEqual({ key: 'val' })
    })
  })
})
