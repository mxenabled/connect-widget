import { buildClientSessionTimeoutURL } from 'src/utilities/timeoutHelper'

vi.useFakeTimers()

describe('buildClientSessionTimeoutURL', () => {
  test('should do nothing if no url is supplied', () => {
    expect(buildClientSessionTimeoutURL()).toEqual(null)
  })

  test('should do nothing if url is empty string', () => {
    expect(buildClientSessionTimeoutURL('')).toEqual(null)
  })

  test('should handle no template at all', () => {
    const url = 'https://mx.com'
    const result = buildClientSessionTimeoutURL(url)

    expect(url).toEqual(result)
  })

  test('should handle the widgetType template', () => {
    const url = 'https://mx.com/{widgetType}'
    const widgetType = 'connect_widget'

    const result = buildClientSessionTimeoutURL(url, widgetType)

    expect(result).toEqual('https://mx.com/connect_widget')
  })

  test('should leave as is if template is not widgetType', () => {
    const url = 'https://mx.com/{badTemplate}'
    const widgetType = 'connect_widget'

    expect(buildClientSessionTimeoutURL(url, widgetType)).toEqual(url)
  })
})
