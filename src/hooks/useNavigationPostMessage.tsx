import { useContext, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { PostMessageContext } from 'src/ConnectWidget'

import { STEPS } from 'src/const/Connect'
import PostMessage from 'src/utilities/PostMessage'

import { RootState } from 'src/redux/Store'
import { ActionTypes } from 'src/redux/actions/Connect'
import { selectConnectConfig, selectInitialConfig } from 'src/redux/reducers/configSlice'

export const useNavigationPostMessage = () => {
  const postMessageFunctions = useContext(PostMessageContext)
  const dispatch = useDispatch()
  const connectConfig = useSelector(selectConnectConfig)
  const initialConfig = useSelector(selectInitialConfig)
  const step = useSelector(
    (state: RootState) =>
      state.connect.location[state.connect.location.length - 1]?.step ?? STEPS.SEARCH,
  )

  useEffect(() => {
    // When Connect is being used within our SDK's, we need to support an OS level back action
    // We listen to a specific event to handle our postMessage callback with our `did_go_back` boolean
    // To allow the host to know if we are still within Connect or to close it.
    window.addEventListener('message', _handleNavigationPostMessage)

    return () => window.removeEventListener('message', _handleNavigationPostMessage)
  }, [])

  const _handleNavigationPostMessage = (event: MessageEvent) => {
    const eventData = PostMessage.parse(event.data)
    if (eventData.type === 'mx/navigation') {
      // Specifically looking for the 'back' action, in the future we could support others
      if (eventData.payload.action === 'back') {
        const dontChangeConnectStep =
          step === STEPS.SEARCH ||
          step === STEPS.DISCLOSURE ||
          step === STEPS.VERIFY_EXISTING_MEMBER ||
          connectConfig.disable_institution_search

        if (dontChangeConnectStep) {
          // We consider SEARCH and DISCLOSURE to be as far back as Connect goes.
          // Loaded in verify mode, we show VERIFY_EXISTING_MEMBER as the root.
          // If disable_institution_search is `true`, we do not show the SEARCH step.
          // If any of those conditions are met, we do not change the step when a back navigation event is received.
          // Communicate that we did not go back to the SDK via the `did_go_back` payload.
          postMessageFunctions.onPostMessage('navigation', { did_go_back: false })
        } else {
          // We want to reset connect by taking us back to the SEARCH or VERIFY_EXISTING_MEMBER step depending on config
          dispatch({
            type: ActionTypes.GO_BACK_POST_MESSAGE,
            payload: initialConfig,
          })

          // And communicating that we did go back to the SDK
          postMessageFunctions.onPostMessage('navigation', { did_go_back: true })
        }
      }
    }
  }
}
