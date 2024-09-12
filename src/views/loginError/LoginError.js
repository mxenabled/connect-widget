import React, {
  Fragment,
  useEffect,
  useState,
  useRef,
  useImperativeHandle,
  useContext,
} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import PropTypes from 'prop-types'

import { Text } from '@kyper/text'

import { __ } from 'src/utilities/Intl'

import { ActionTypes } from 'src/redux/actions/Connect'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'

import { ReadableStatuses } from 'src/const/Statuses'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { POST_MESSAGES } from 'src/const/postMessages'
import { getMemberStatusMessage } from 'src/const/consts'

import { SlideDown } from 'src/components/SlideDown'
import { ViewTitle } from 'src/components/ViewTitle'
import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { Support, VIEWS as SUPPORT_VIEWS } from 'src/components/support/Support'

import { LeavingAction } from 'src/views/loginError/LeavingAction'
import { PrimaryActions } from 'src/views/loginError/PrimaryActions'
import { SecondaryActions } from 'src/views/loginError/SecondaryActions'
import { MessageBoxStatus } from 'src/views/loginError/MessageBoxStatus'
import { ImpededMemberError } from 'src/views/loginError/ImpededMemberError'
import { NoEligibleAccounts } from 'src/views/loginError/NoEligibleAccountsError'

import { getDelay } from 'src/utilities/getDelay'

import {
  REFRESH,
  GET_HELP,
  VISIT_WEBSITE,
  DISCONNECT_INSTITUTION,
  UPDATE_CREDENTIALS,
  OK,
  TRY_ANOTHER_INSTITUTION,
} from 'src/views/loginError/consts'

import { PostMessageContext } from 'src/ConnectWidget'

export const LoginError = React.forwardRef(
  (
    {
      isDeleteInstitutionOptionEnabled,
      member,
      size,
      institution,
      onDeleteConnectionClick,
      onRefreshClick,
      onUpdateCredentialsClick,
      showSupport,
      showExternalLinkPopup,
    },
    navigationRef,
  ) => {
    const supportNavRef = useRef(null)
    const postMessageFunctions = useContext(PostMessageContext)
    const dispatch = useDispatch()
    const hasInvalidData = useSelector((state) => state.connect.hasInvalidData || false)
    const connectConfig = useSelector(selectConnectConfig)
    const pageViewInfo = hasInvalidData
      ? PageviewInfo.CONNECT_NO_ELIGIBLE_ACCOUNTS
      : PageviewInfo.CONNECT_LOGIN_ERROR
    useAnalyticsPath(...pageViewInfo)

    const [isLeaving, setIsLeaving] = useState(false)
    const [showSupportView, setShowSupportView] = useState(false)

    const getNextDelay = getDelay()

    useImperativeHandle(navigationRef, () => {
      return {
        handleBackButton() {
          if (showSupportView) {
            supportNavRef.current.handleCloseSupport()
          }
        },
        showBackButton() {
          if (showSupportView) {
            return true
          }
          return false
        },
      }
    }, [showSupportView])

    useEffect(() => {
      if (hasInvalidData) {
        postMessageFunctions.onPostMessage('connect/invalidData', {
          member: {
            guid: member.guid,
            code: member.most_recent_job_detail_code,
          },
        })
      } else {
        postMessageFunctions.onPostMessage('connect/memberError', {
          member: {
            guid: member.guid,
            connection_status: member.connection_status,
          },
        })
      }
    }, [member])

    const loginErrorStartOver = () =>
      dispatch({ type: ActionTypes.LOGIN_ERROR_START_OVER, payload: { mode: connectConfig.mode } })

    const handleOkPrimaryActionClick = () => {
      postMessageFunctions.onPostMessage('connect/memberError/primaryAction', {
        member: {
          guid: member.guid,
          connection_status: member.connection_status,
        },
      })
      postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)

      if (connectConfig?.disable_institution_search) {
        onUpdateCredentialsClick()
      } else {
        loginErrorStartOver()
      }
    }

    const memberStatusActionsMap = {
      [ReadableStatuses.PREVENTED]: {
        variant: 'error',
        title: __('New credentials needed'),
        message: getMemberStatusMessage(ReadableStatuses.PREVENTED, institution.name),
        primary: [UPDATE_CREDENTIALS],
        secondary: [GET_HELP, VISIT_WEBSITE, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.DENIED]: {
        variant: 'error',
        title: __('Please re-enter your credentials'),
        message: getMemberStatusMessage(ReadableStatuses.DENIED, institution.name),
        primary: [UPDATE_CREDENTIALS],
        secondary: [GET_HELP, VISIT_WEBSITE, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.REJECTED]: {
        renderBody: (
          <Text as="Paragraph" data-test="memberStatusText" role="alert" tag="p">
            {getMemberStatusMessage(ReadableStatuses.REJECTED, institution.name)}
          </Text>
        ),
        variant: 'error',
        title: __('Incorrect information'),
        message: getMemberStatusMessage(ReadableStatuses.REJECTED, institution.name),
        primary: [REFRESH],
        secondary: [TRY_ANOTHER_INSTITUTION, GET_HELP, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.LOCKED]: {
        variant: 'error',
        title: __('Account is locked'),
        message: getMemberStatusMessage(ReadableStatuses.LOCKED, institution.name),
        primary: [],
        secondary: [GET_HELP, VISIT_WEBSITE, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.IMPEDED]: {
        renderBody: (
          <ImpededMemberError
            institution={institution}
            message={getMemberStatusMessage(ReadableStatuses.IMPEDED, institution.name)}
            onRefreshClick={onRefreshClick}
            setIsLeaving={setIsLeaving}
            showExternalLinkPopup={showExternalLinkPopup}
            title={__('Your attention is needed')}
          />
        ),
        primary: [],
        secondary: [GET_HELP, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.DEGRADED]: {
        renderBody: (
          <Text as="Paragraph" role="alert" tag="p">
            {__('We are upgrading this connection. Please try again later.')}
          </Text>
        ),
        variant: 'help',
        title: __('Connection maintenance'),
        message: getMemberStatusMessage(ReadableStatuses.DEGRADED, institution.name),
        primary: [OK],
        secondary: [GET_HELP, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.DISCONNECTED]: {
        variant: 'help',
        title: __('Connection maintenance'),
        message: getMemberStatusMessage(ReadableStatuses.DISCONNECTED, institution.name),
        primary: [],
        secondary: [GET_HELP, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.DISCONTINUED]: {
        variant: 'error',
        title: __('Connection discontinued'),
        message: getMemberStatusMessage(ReadableStatuses.DISCONTINUED, institution.name),
        primary: [],
        secondary: [GET_HELP, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.CLOSED]: {
        variant: 'error',
        title: __('Closed account'),
        message: getMemberStatusMessage(ReadableStatuses.CLOSED, institution.name),
        primary: [],
        secondary: [VISIT_WEBSITE, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.FAILED]: {
        variant: 'error',
        title: __('Connection failed'),
        message: getMemberStatusMessage(ReadableStatuses.FAILED, institution.name),
        primary: [],
        secondary: [GET_HELP, VISIT_WEBSITE, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.DISABLED]: {
        variant: 'error',
        title: __('Connection disabled'),
        message: getMemberStatusMessage(ReadableStatuses.DISABLED, institution.name),
        primary: [],
        secondary: [GET_HELP, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.IMPORTED]: {
        variant: 'error',
        title: __('New credentials needed'),
        message: getMemberStatusMessage(ReadableStatuses.IMPORTED, institution.name),
        primary: [UPDATE_CREDENTIALS],
        secondary: [GET_HELP, DISCONNECT_INSTITUTION],
      },
      [ReadableStatuses.CHALLENGED]: {
        variant: 'error',
        title: __('Something went wrong'),
        message: __('Please try again or come back later.'),
        primary: [REFRESH],
        secondary: [],
      },
      [ReadableStatuses.EXPIRED]: {
        variant: 'error',
        title: __('Credentials expired'),
        message: getMemberStatusMessage(ReadableStatuses.EXPIRED, institution.name),
        primary: [REFRESH],
        secondary: [],
      },
      [ReadableStatuses.IMPAIRED]: {
        variant: 'error',
        title: __('New credentials needed'),
        message: getMemberStatusMessage(ReadableStatuses.IMPAIRED, institution.name),
        primary: [UPDATE_CREDENTIALS],
        secondary: [VISIT_WEBSITE, DISCONNECT_INSTITUTION],
      },
    }

    const defaultMemberStatusAction = {
      variant: 'error',
      title: __('Something went wrong'),
      message: __("We've notified support and are looking into the issue. Please try again later."),
      primary: [],
      secondary: [GET_HELP, DISCONNECT_INSTITUTION],
    }

    let statusActions
    if (hasInvalidData) {
      statusActions = {
        renderBody: <NoEligibleAccounts />,
        primary: [],
        secondary: [],
        title: '',
      }
    } else {
      statusActions = memberStatusActionsMap[member.connection_status] || defaultMemberStatusAction
    }

    if (showSupportView) {
      return (
        <Support
          loadToView={SUPPORT_VIEWS.GENERAL_SUPPORT}
          onClose={() => setShowSupportView(false)}
          ref={supportNavRef}
        />
      )
    }

    return (
      <React.Fragment>
        {isLeaving ? (
          <SlideDown>
            <LeavingAction institution={institution} setIsLeaving={setIsLeaving} size={size} />
          </SlideDown>
        ) : (
          <Fragment>
            <SlideDown delay={getNextDelay()}>
              <InstitutionBlock institution={institution} />
            </SlideDown>

            <SlideDown delay={getNextDelay()}>
              <ViewTitle connectionStatus={member.connection_status} title={statusActions.title} />
            </SlideDown>

            <SlideDown delay={getNextDelay()}>
              {statusActions.renderBody ? (
                statusActions.renderBody
              ) : (
                <MessageBoxStatus message={statusActions.message} variant={statusActions.variant} />
              )}
            </SlideDown>

            {statusActions.primary.length > 0 && (
              <SlideDown delay={getNextDelay()}>
                <PrimaryActions
                  actions={statusActions.primary}
                  onOkClick={handleOkPrimaryActionClick}
                  onRefreshClick={onRefreshClick}
                  onUpdateCredentialsClick={onUpdateCredentialsClick}
                />
              </SlideDown>
            )}

            {statusActions.secondary.length > 0 && (
              <SlideDown delay={getNextDelay()}>
                <SecondaryActions
                  actions={statusActions.secondary}
                  institution={institution}
                  isDeleteInstitutionOptionEnabled={isDeleteInstitutionOptionEnabled}
                  member={member}
                  onDeleteConnectionClick={onDeleteConnectionClick}
                  onGetHelpClick={() => setShowSupportView(true)}
                  onTryAnotherInstitutionClick={() => {
                    postMessageFunctions.onPostMessage(POST_MESSAGES.BACK_TO_SEARCH)
                    loginErrorStartOver()
                  }}
                  setIsLeaving={setIsLeaving}
                  showExternalLinkPopup={showExternalLinkPopup}
                  showSupport={showSupport}
                />
              </SlideDown>
            )}
          </Fragment>
        )}
      </React.Fragment>
    )
  },
)

LoginError.propTypes = {
  institution: PropTypes.object.isRequired,
  isDeleteInstitutionOptionEnabled: PropTypes.bool.isRequired,
  member: PropTypes.object.isRequired,
  onDeleteConnectionClick: PropTypes.func.isRequired,
  onRefreshClick: PropTypes.func.isRequired,
  onUpdateCredentialsClick: PropTypes.func.isRequired,
  showExternalLinkPopup: PropTypes.bool.isRequired,
  showSupport: PropTypes.bool.isRequired,
  size: PropTypes.string.isRequired,
}

LoginError.displayName = 'LoginError'
