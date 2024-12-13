/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useReducer, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Action } from 'redux'
import { getUnixTime } from 'date-fns'
import { defer } from 'rxjs'

import { AttentionFilled } from '@kyper/icon/AttentionFilled'
import { Text } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'

import { getTrueWidth } from 'src/redux/selectors/Browser'
import { updateUserProfile } from 'src/redux/reducers/profilesSlice'

import { __ } from 'src/utilities/Intl'
import { shouldShowTooSmallDialogFromSnooze } from 'src/utilities/Browser'
import { getEnvironment, Environments } from 'src/utilities/global'
import { PageviewInfo } from 'src/const/Analytics'
import { APP_MIN_WIDTH } from 'src/const/app'
import { useApi } from 'src/context/ApiContext'

interface TooSmallDialogProps {
  onAnalyticPageview: (_path: string, _metadata: object) => void
}

export const TooSmallDialog = (props: TooSmallDialogProps) => {
  const [state, dispatch] = useReducer(reducer, {
    showDialog: false,
    tooSmallDialogDismissedThisSession: false,
    isDismissing: false,
  })
  const reduxDispatch = useDispatch()
  const trueWidth = useSelector(getTrueWidth)
  const userProfile = useSelector((state: any) => state.profiles.userProfile)
  const widgetProfile = useSelector((state: any) => state.profiles.widgetProfile)
  const [pageviewSent, setPagviewSent] = useState(false)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const { api } = useApi()

  useEffect(() => {
    const shouldShowtooSmallConsiderSnooze = shouldShowTooSmallDialogFromSnooze(
      userProfile?.too_small_modal_dismissed_at || null,
      widgetProfile?.too_small_modal_threshold_days,
    )
    const isProdEnvironment = (getEnvironment() as unknown) === Environments.PRODUCTION
    const shouldShowTooSmallDialog =
      shouldShowtooSmallConsiderSnooze && trueWidth < APP_MIN_WIDTH && !isProdEnvironment

    if (shouldShowTooSmallDialog) {
      // user decreased size
      if (!pageviewSent) {
        props.onAnalyticPageview('/connect' + PageviewInfo.CONNECT_UNSUPPORTED_RESOLUTION[1], {})
        setPagviewSent(true)
      }
      dispatch({ type: 'showDialog' })
    } else {
      // user increased size
      dispatch({ type: 'hideDialog' })
    }
  }, [trueWidth])

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (state.isDismissing) {
      const dismissModal$ = defer(() =>
        api.updateUserProfile({
          ...userProfile,
          too_small_modal_dismissed_at: getUnixTime(new Date()),
        }),
      ).subscribe(
        (data) => {
          reduxDispatch(updateUserProfile(data))
          dispatch({ type: 'dismissDialogSuccess' })
        },
        () => {
          // If error, we still dismiss the modal for this session.
          //User will see modal next session and can try again to dismiss.
          dispatch({ type: 'dismissDialogSuccess' })
        },
      )

      return () => dismissModal$.unsubscribe()
    }
  }, [state.isDismissing])

  return state.showDialog ? (
    <div style={styles.container}>
      <AttentionFilled color={tokens.Color.Neutral700} height={32} style={styles.icon} width={32} />
      <Text component="h2" style={styles.title}>
        {__('Unsupported Resolution')}
      </Text>
      <Text component="p">
        {__(
          'Your screen zoom setting may not be compatible with the current screen size. The minimum supported width is 320 pixels. Please reduce your screen zoom setting to view all the content.',
        )}
      </Text>
      <Button
        fullWidth={true}
        onClick={() => dispatch({ type: 'dismissDialog' })}
        style={styles.dismissButton}
        variant="contained"
      >
        {__('Dismiss')}
      </Button>
    </div>
  ) : null
}

const getStyles = (tokens: any) => {
  return {
    container: {
      background: tokens.BackgroundColor.Modal,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: `0 ${tokens.Spacing.ContainerSidePadding}px`,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      textAlign: 'center',
      maxWidth: '352px', // Our max content width (does not include side margin)
      minWidth: '270px', // Our min content width (does not include side margin)
      zIndex: tokens.ZIndex.MessageBox,
    } as React.CSSProperties,
    title: {
      marginBottom: tokens.Spacing.Tiny,
    },
    dismissButton: {
      marginTop: tokens.Spacing.XLarge,
      marginBottom: tokens.Spacing.Medium,
    },
    icon: {
      marginBottom: tokens.Spacing.Large,
      marginTop: tokens.Spacing.Jumbo,
      paddingTop: tokens.Spacing.Tiny,
    },
  }
}

const reducer = (state: any, action: Action) => {
  switch (action.type) {
    case 'showDialog':
      return {
        ...state,
        showDialog: true,
      }

    case 'hideDialog':
      return {
        ...state,
        showDialog: false,
      }

    case 'dismissDialog':
      return {
        ...state,
        isDismissing: true,
      }

    case 'dismissDialogSuccess':
      return {
        ...state,
        isDismissing: false,
        showDialog: false,
        tooSmallModalDismissedThisSession: true,
      }

    default:
      return state
  }
}
