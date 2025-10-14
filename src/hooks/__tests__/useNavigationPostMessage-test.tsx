import { act, renderHook, waitFor } from 'src/utilities/testingLibrary'
import { useNavigationPostMessage } from '../useNavigationPostMessage'
import { STEPS } from 'src/const/Connect'

// Mock window.parent.postMessage
const postMessageMock = vitest.fn()
const originalParent = window.parent

const dispatch = vitest.fn()
vitest.mock('react-redux', async (importActual) => {
  const actual = (await importActual()) as object
  return { ...actual, useDispatch: () => dispatch }
})

beforeAll(() => {
  Object.defineProperty(window, 'parent', {
    value: { postMessage: postMessageMock },
    writable: true,
  })
})

afterAll(() => {
  Object.defineProperty(window, 'parent', {
    value: originalParent,
    writable: true,
  })
})

const initialState = {
  connect: { location: [{ step: STEPS.SEARCH }] },
}

describe('useNavigationPostMessage', () => {
  beforeEach(() => {
    postMessageMock.mockClear()
  })

  it('should dispatch GO_BACK_POST_MESSAGE if allowed', () => {
    renderHook(() => useNavigationPostMessage(), { preloadedState: initialState })

    act(() => {
      window.postMessage({ type: 'mx/navigation', payload: { action: 'back' } }, '*')
    })

    waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({
        type: 'GO_BACK_POST_MESSAGE',
        payload: initialState,
      })
    })
  })

  it('should not dispatch GO_BACK_POST_MESSAGE if not allowed', () => {
    renderHook(() => useNavigationPostMessage(), {
      preloadedState: {
        ...initialState,
        connect: { location: [{ step: STEPS.ENTER_CREDENTIALS }] },
      },
    })

    act(() => {
      window.postMessage({ type: 'mx/navigation', payload: { action: 'back' } }, '*')
    })

    waitFor(() => {
      expect(dispatch).not.toHaveBeenCalledWith({
        type: 'GO_BACK_POST_MESSAGE',
        payload: initialState,
      })
    })
  })
})
