import _get from 'lodash/get'
import { of } from 'rxjs'
import {
  bufferTime,
  catchError,
  concatAll,
  concatMap,
  delay,
  ignoreElements,
  mergeMap,
  tap,
} from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { sendPostMessage, setWebviewURL } from 'src/connect/utilities/PostMessage'

import { ActionTypes } from 'reduxify/actions/PostMessage'

export const postMessages = (actions$, state$) =>
  actions$.pipe(
    ofType(ActionTypes.SEND_POST_MESSAGE),
    /**
     * This bufferTime and mergeMap with a delay are a little weird. The reason we have this is because iOS
     * seems to be ignoring navigation events from the webview if they come too fast.
     * The time is arbitrary and seems to work. Basically it seems like even these tiny delays are enough.
     * Be careful changing the buffer and delay times here. If the output cadence becomes slower
     * than the input cadence, consistently, it can cause memory leaks. This shouldn't be an issue
     * since postmessage events shouldn't be happening in quick succession for prolonged periods of time.
     *
     * Also, this no longer needs to emit anything. The success/fail/error messages were not that useful
     * and caused a ton of noise in the redux logs, So I took them out. This doesn't technically need to
     * be an epic anymore, it could be an app wide stream, but I didn't want to change too much at one time.
     */
    bufferTime(20), // buffer up messages for 20ms
    mergeMap((actions) => {
      // take the buffered actions and "space them out" by 10ms each
      return of(actions).pipe(
        concatMap((xs) => xs.map((x) => of(x).pipe(delay(10)))),
        concatAll(),
      )
    }),
    tap(({ payload }) => {
      const config = _get(state$, 'value.config.app', {})
      const session_guid = _get(state$, 'value.analytics.currentSession.guid', '')
      const user_guid = _get(state$, 'value.profiles.user.guid', '')
      const metadata = {
        session_guid,
        user_guid,
        ...payload.data,
      }

      // This epic only handles v4 post messages
      if (config.ui_message_version !== 4) {
        return
      }

      const POSTMESSAGE_TYPES = {
        MESSAGE: 'message',
        URL: 'url',
      }

      const postMessageType = config.is_mobile_webview
        ? POSTMESSAGE_TYPES.URL
        : POSTMESSAGE_TYPES.MESSAGE

      if (postMessageType === POSTMESSAGE_TYPES.URL) {
        // If v4 and mobile webiew, use the setting url approach
        setWebviewURL(payload.event, metadata, config.ui_message_webview_url_scheme)
      } else {
        // If just v4, use new post message sending
        sendPostMessage(payload.event, metadata)
      }
    }),
    // If a post message fails, we don't really have a plan, so just ignore the
    // errors for now. Can use this to debug.
    catchError(() => of(null)),
    ignoreElements(),
  )
