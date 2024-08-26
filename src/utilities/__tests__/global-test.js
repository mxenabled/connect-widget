import { isScrollableUrl, urlWithHttps, getEnvironment, Environments } from 'src/utilities/global'

describe('Global Util Tests', () => {
  describe('urlWithHttps', () => {
    it('should return the url if it already has https', () => {
      const url = 'https://www.mx.com'

      expect(urlWithHttps(url)).toEqual('https://www.mx.com/')
    })

    it('should return the url with secure protocol', () => {
      const url = 'http://www.mx.com'

      expect(urlWithHttps(url)).toEqual('https://www.mx.com/')
    })

    it('should return the url with https', () => {
      const url = 'www.mx.com'

      expect(urlWithHttps(url)).toEqual('https://www.mx.com')
    })

    it('should handle other protocols without adding https', () => {
      // In node/test environment, the url.protocol can only be changed to https
      // if the protocol is already a special protocol. In the browser this works
      // with all protocols. More info: https://nodejs.org/api/url.html#urlprotocol
      const fileUrl = 'file://etc/password'
      const ftpUrl = 'ftp://etc/password'
      const wsUrl = 'ws://etc/password'

      expect(urlWithHttps(fileUrl)).toEqual('https://etc/password')
      expect(urlWithHttps(ftpUrl)).toEqual('https://etc/password')
      expect(urlWithHttps(wsUrl)).toEqual('https://etc/password')
    })
  })

  describe('isScrollableUrl', () => {
    it('should return true if the url starts with #', () => {
      const url = '#about'

      expect(isScrollableUrl(url)).toEqual(true)
    })

    it('should return false if it is a full url', () => {
      const url = 'https://www.mx.com'

      expect(isScrollableUrl(url)).toEqual(false)
    })
  })

  describe('getEnvironment', () => {
    it('should return the environment based on the location host', () => {
      // Delete the location object and create to be able to set the host
      delete global.window.location
      global.window = Object.create(window)
      global.window.location = {}

      window.location.host = 'localhost:3000'
      expect(getEnvironment()).toEqual(Environments.SANDBOX)

      window.location.host = 'widgets.sand.internal.mx'
      expect(getEnvironment()).toEqual(Environments.SANDBOX)

      window.location.host = 'widgets.qa.internal.mx'
      expect(getEnvironment()).toEqual(Environments.QA)

      window.location.host = 'widgets.int.internal.mx'
      expect(getEnvironment()).toEqual(Environments.INTEGRATION)

      window.location.host = 'widgets.mx'
      expect(getEnvironment()).toEqual(Environments.PRODUCTION)
    })
  })
})
