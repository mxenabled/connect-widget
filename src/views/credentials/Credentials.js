import React, {
  Fragment,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useContext,
} from 'react'
import PropTypes from 'prop-types'
import _isEmpty from 'lodash/isEmpty'
import { useSelector } from 'react-redux'

import { Text } from '@mxenabled/mxui'
import { MessageBox } from '@kyper/messagebox'
import { useTokens } from '@kyper/tokenprovider'
import { TextField } from 'src/privacy/input'
import { Button } from '@mui/material'

import { __ } from 'src/utilities/Intl'
import { getInstitutionLoginUrl } from 'src/utilities/Institution'
import { fadeOut } from 'src/utilities/Animation'

import { selectConnectConfig } from 'src/redux/reducers/configSlice'

import { AGG_MODE } from 'src/const/Connect'
import { ReadableStatuses } from 'src/const/Statuses'

import { AnalyticEvents } from 'src/const/Analytics'
import { AriaLive } from 'src/components/AriaLive'

import { MemberError } from 'src/components/MemberError'
import { SlideDown } from 'src/components/SlideDown'
import { LeavingNoticeFlat } from 'src/components/LeavingNoticeFlat'
import { InstitutionBlock } from 'src/components/InstitutionBlock'
import { InstructionalText } from 'src/components/InstructionalText'
import { InstructionList } from 'src/components/InstructionList'
import { Support, VIEWS as SUPPORT_VIEWS } from 'src/components/support/Support'
import { getCurrentMember, getSelectedInstitution } from 'src/redux/selectors/Connect'

import { buildInitialValues, buildFormSchema } from 'src/views/credentials/utils'
import { CREDENTIAL_FIELD_TYPES } from 'src/views/credentials/consts'

import { useForm } from 'src/hooks/useForm'
import { getDelay } from 'src/utilities/getDelay'
import { goToUrlLink } from 'src/utilities/global'

import { scrollToTop } from 'src/utilities/ScrollToTop'

import PoweredByMX from 'src/views/disclosure/PoweredByMX'
import StickyComponentContainer from 'src/components/StickyComponentContainer'
import { DisclosureInterstitial } from 'src/views/disclosure/Interstitial'
import { usePasswordInputValidation } from 'src/views/credentials/usePasswordInputValidation'

import useAnalyticsEvent from 'src/hooks/useAnalyticsEvent'
import { PostMessageContext } from 'src/ConnectWidget'

export const Credentials = React.forwardRef(
  (
    {
      credentials = [],
      error,
      handleSubmitCredentials,
      isProcessingMember,
      onDeleteConnectionClick,
      onGoBackClick,
    },
    navigationRef,
  ) => {
    const sendAnalyticsEvent = useAnalyticsEvent()

    const containerRef = useRef(null)
    const interstitialRef = useRef(null)
    const interstitialNavRef = useRef(null)
    const supportNavRef = useRef(null)
    const { handleBlur, handleFocus, handleSpaceValidation, PasswordShowButton, validations } =
      usePasswordInputValidation()
    // Redux Selectors/Dispatch
    const connectConfig = useSelector(selectConnectConfig)
    const isSmall = useSelector((state) => state.browser.size) === 'small'
    const institution = useSelector(getSelectedInstitution)
    const showExternalLinkPopup = useSelector(
      (state) => state.profiles.clientProfile.show_external_link_popup,
    )
    const showSupport = useSelector(
      (state) =>
        state.profiles.widgetProfile.enable_support_requests && connectConfig.mode === AGG_MODE,
    )
    const showDisclosureStep = useSelector(
      (state) => state.profiles.widgetProfile.display_disclosure_in_connect,
    )
    const showMXBranding = useSelector((state) => state.profiles.widgetProfile.show_mx_branding)
    const currentMember = useSelector(getCurrentMember)
    const isDeleteInstitutionOptionEnabled = useSelector(
      (state) => state.profiles?.widgetProfile?.display_delete_option_in_connect ?? true,
    )
    const updateCredentials = useSelector((state) => state.connect.updateCredentials)

    const postMessageFunctions = useContext(PostMessageContext)
    // Component state
    const [isLeavingUrl, setIsLeavingUrl] = useState(null)
    const [currentRecoveryInstution, setRecoveryInstitution] = useState(null)
    const [showSupportView, setShowSupportView] = useState(false)
    const [showInterstitialDisclosure, setShowInterstitialDisclosure] = useState(false)
    const [needToSendAnalyticEvent, setNeedToSendAnalyticEvent] = useState(true)
    const [needToSendPasswordAnalyticEvent, setPasswordAnalyticEvent] = useState(true)

    const tokens = useTokens()
    const styles = getStyles(tokens, isSmall)
    const getNextDelay = getDelay(0, 100)
    const initialValues = buildInitialValues(credentials)
    const formSchema = buildFormSchema(credentials)
    const loginFieldCount = credentials.length
    const showDisconnectOption =
      currentMember &&
      currentMember.is_managed_by_user &&
      !currentMember.is_being_aggreated &&
      isDeleteInstitutionOptionEnabled

    const selectedInstructionalData = {
      description:
        currentMember?.instructional_data?.description ??
        institution?.instructional_data?.description,
      steps: currentMember?.instructional_data?.steps ?? institution?.instructional_data?.steps,
      title: currentMember?.instructional_data?.title ?? institution?.instructional_data?.title,
    }

    const recoveryUrls = [
      {
        dataTest: 'forgot-password',
        url: institution.forgot_password_credential_recovery_url,
        recoveryText: __('Forgot your password?'),
        analyticEvent: updateCredentials
          ? AnalyticEvents.UPDATE_CREDENTIALS_CLICKED_FORGOT_PASSWORD
          : AnalyticEvents.CREATE_CREDENTIALS_CLICKED_FORGOT_PASSWORD,
      },
      {
        dataTest: 'forgot-username',
        url: institution.forgot_username_credential_recovery_url,
        recoveryText: __('Forgot your username?'),
        analyticEvent: updateCredentials
          ? AnalyticEvents.UPDATE_CREDENTIALS_CLICKED_FORGOT_USERNAME
          : AnalyticEvents.CREATE_CREDENTIALS_CLICKED_FORGOT_USERNAME,
      },
      {
        dataTest: 'forgot-trouble-signing-in',
        url: institution.trouble_signing_credential_recovery_url,
        recoveryText: __('Trouble signing in?'),
        analyticEvent: updateCredentials
          ? AnalyticEvents.UPDATE_CREDENTIALS_CLICKED_TROUBLE_SIGNING_IN
          : AnalyticEvents.CREATE_CREDENTIALS_CLICKED_TROUBLE_SIGNING_IN,
      },
    ].filter((url) => {
      return url.url
    })
    function credentialRecovery() {
      if (recoveryUrls.length) {
        return recoveryUrls.map((recoveryInstitution, i) => {
          return (
            <Button
              data-test={`credential-recovery-button-${recoveryInstitution.dataTest}`}
              fullWidth={true}
              key={i}
              onClick={() => {
                if (showExternalLinkPopup) {
                  setIsLeavingUrl(recoveryInstitution.url)
                  setRecoveryInstitution(recoveryInstitution)
                } else {
                  sendAnalyticsEvent(recoveryInstitution.analyticEvent, {
                    institution_guid: institution.guid,
                    institution_name: institution.name,
                  })
                  goToUrlLink(recoveryInstitution.url)
                }
              }}
              role="link"
              variant="text"
            >
              {recoveryInstitution.recoveryText}
            </Button>
          )
        })
      } else {
        return (
          <Button
            data-test="credentials-recovery-button-institution-website"
            fullWidth={true}
            onClick={() => {
              if (showExternalLinkPopup) {
                setIsLeavingUrl(getInstitutionLoginUrl(institution))
              } else {
                goToUrlLink(getInstitutionLoginUrl(institution))
              }
            }}
            role="link"
            variant="text"
          >
            {__("Go to institution's website")}
          </Button>
        )
      }
    }

    const handleUserNameTextChange = (e) => {
      if (needToSendAnalyticEvent) {
        sendAnalyticsEvent(AnalyticEvents.ENTERED_LOGIN, {
          institution_guid: institution.guid,
          institution_name: institution.name,
        })

        setNeedToSendAnalyticEvent(false)
      }

      handleTextInputChange(e)
    }

    const handlePasswordTextChange = (e) => {
      if (needToSendPasswordAnalyticEvent) {
        sendAnalyticsEvent(AnalyticEvents.ENTERED_PASSWORD, {
          institution_guid: institution.guid,
          institution_name: institution.name,
        })

        setPasswordAnalyticEvent(false)
      }

      handleTextInputChange(e)
    }
    // When working inside a form with a kyper/password input
    // When pressing enter it wants to toggle the hide/show button
    // This is a way to manually check for ENTER and attempt the submit fn
    const handlePasswordEnterChange = (e) => {
      // Enter key
      if (e.keyCode === 13) {
        handleSubmit(e)
      }
    }

    const { values, handleTextInputChange, handleSubmit, errors } = useForm(
      attemptConnect,
      formSchema,
      initialValues,
    )

    const inputRefs = useRef({})

    useEffect(() => {
      for (const field of credentials) {
        if (errors[field.field_name]) {
          inputRefs.current[field.field_name]?.focus()
          break
        }
      }
    }, [errors])

    function attemptConnect() {
      const credentialsPayload = credentials.map((credential) => {
        return {
          guid: credential.guid,
          value: values[credential.field_name],
        }
      })

      handleSubmitCredentials(credentialsPayload)

      sendAnalyticsEvent(AnalyticEvents.SUBMITTED_CREDENTIALS, {
        institution_guid: institution.guid,
        institution_name: institution.name,
      })
    }

    useEffect(() => {
      if (currentMember.connection_status === ReadableStatuses.DENIED) {
        postMessageFunctions.onPostMessage('connect/memberError', {
          member: {
            guid: currentMember.guid,
            connection_status: currentMember.connection_status,
          },
        })
      }
    }, [currentMember])

    useImperativeHandle(navigationRef, () => {
      return {
        handleBackButton() {
          if (showInterstitialDisclosure) {
            interstitialNavRef.current.handleCloseInterstitial()
          } else if (showSupportView) {
            supportNavRef.current.handleCloseSupport()
          } else {
            fadeOut(containerRef.current, 'up', 300).then(() => {
              onGoBackClick()
            })
          }
        },
        showBackButton() {
          return (
            (!isProcessingMember && !connectConfig.disable_institution_search) ||
            showInterstitialDisclosure
          )
        },
      }
    }, [
      connectConfig.disable_institution_search,
      isProcessingMember,
      showInterstitialDisclosure,
      showSupportView,
    ])

    if (showSupportView) {
      return (
        <Support
          loadToView={SUPPORT_VIEWS.MENU}
          onClose={() => setShowSupportView(false)}
          ref={supportNavRef}
        />
      )
    }

    if (isLeavingUrl) {
      return (
        <SlideDown>
          <LeavingNoticeFlat
            onCancel={() => {
              setIsLeavingUrl(null)
              setRecoveryInstitution(null)
            }}
            onContinue={() => {
              if (currentRecoveryInstution?.analyticEvent) {
                sendAnalyticsEvent(currentRecoveryInstution.analyticEvent, {
                  institution_guid: institution.guid,
                  institution_name: institution.name,
                })
              }
              goToUrlLink(isLeavingUrl)
            }}
          />
        </SlideDown>
      )
    }

    if (showInterstitialDisclosure) {
      return (
        <div ref={interstitialRef}>
          <DisclosureInterstitial
            handleGoBack={() => setShowInterstitialDisclosure(false)}
            ref={interstitialNavRef}
            scrollToTop={() => {
              scrollToTop(interstitialRef)
            }}
          />
        </div>
      )
    }

    const footer =
      !showDisclosureStep && showMXBranding ? (
        <PoweredByMX
          onClick={() => {
            scrollToTop(containerRef)
            setShowInterstitialDisclosure(true)
          }}
        />
      ) : null

    return (
      <StickyComponentContainer footer={footer} ref={containerRef}>
        <Fragment>
          <SlideDown delay={getNextDelay()}>
            <InstitutionBlock
              institution={institution}
              style={{ marginBottom: tokens.Spacing.Large }}
            />
          </SlideDown>

          <SlideDown delay={getNextDelay()}>
            <Text
              component="h2"
              data-test="title-text"
              style={styles.headerText}
              truncate={false}
              variant="H2"
            >
              {selectedInstructionalData.title ?? __('Enter your credentials')}
            </Text>
          </SlideDown>

          {selectedInstructionalData.description && (
            <SlideDown delay={getNextDelay()}>
              <InstructionalText
                instructionalText={selectedInstructionalData.description}
                setIsLeavingUrl={setIsLeavingUrl}
                showExternalLinkPopup={showExternalLinkPopup}
              />
            </SlideDown>
          )}

          {selectedInstructionalData.steps?.length > 0 && (
            <InstructionList
              items={selectedInstructionalData.steps}
              setIsLeavingUrl={setIsLeavingUrl}
              showExternalLinkPopup={showExternalLinkPopup}
            />
          )}

          {!_isEmpty(error) && (
            <SlideDown delay={getNextDelay()}>
              <MemberError error={error} institution={institution} />
            </SlideDown>
          )}

          {_isEmpty(error) && currentMember.connection_status === ReadableStatuses.DENIED && (
            <SlideDown delay={getNextDelay()}>
              <MessageBox
                data-test="credentials-error-message-box"
                style={styles.credentialsError}
                title={__('Incorrect Credentials')}
                variant="error"
              >
                <Text
                  data-test={'incorrect-credentials'}
                  role="alert"
                  truncate={false}
                  variant="ParagraphSmall"
                >
                  {__(
                    'The credentials entered do not match those at %1. Please correct them below to continue.',
                    institution.name,
                  )}
                </Text>
              </MessageBox>
            </SlideDown>
          )}

          {loginFieldCount > 0 ? (
            <form
              autoComplete="new-password"
              id="credentials_form"
              onSubmit={(e) => e.preventDefault()}
              style={styles.form}
            >
              {credentials.map((field) => (
                <SlideDown delay={getNextDelay()} key={field.guid}>
                  {field.field_type === CREDENTIAL_FIELD_TYPES.PASSWORD ? (
                    <div style={errors[field.field_name] ? styles.inputError : styles.input}>
                      <TextField
                        InputProps={{ endAdornment: <PasswordShowButton /> }}
                        autoCapitalize="none"
                        autoComplete="new-password"
                        disabled={isProcessingMember}
                        error={validations.isError || !!errors[field.field_name]}
                        fullWidth={true}
                        helperText={
                          (validations.isCapsLockOn && __('Caps lock is on')) ||
                          validations.validateSpaceMessage ||
                          errors[field.field_name]
                        }
                        id={field.field_name}
                        inputProps={{
                          'aria-label': field.label,
                          'aria-describedby': errors[field.field_name]
                            ? `${field.field_name}-error`
                            : undefined,
                        }}
                        inputRef={(el) => (inputRefs.current[field.field_name] = el)}
                        label={field.label}
                        name={field.field_name}
                        onBlur={handleBlur}
                        onChange={(e) => {
                          handleSpaceValidation(e)
                          handlePasswordTextChange(e)
                        }}
                        onFocus={handleFocus}
                        onKeyDown={handlePasswordEnterChange}
                        spellCheck="false"
                        type={validations.showPassword ? 'text' : 'password'}
                        value={values[field.field_name] || ''}
                      />
                    </div>
                  ) : (
                    <div style={errors[field.field_name] ? styles.inputError : styles.input}>
                      <TextField
                        autoCapitalize="none"
                        autoComplete="new-password"
                        disabled={isProcessingMember}
                        error={!!errors[field.field_name]}
                        fullWidth={true}
                        helperText={errors[field.field_name]}
                        id={field.field_name}
                        inputProps={{
                          'aria-label': __('Enter your %1', field.label),
                          'aria-describedby': errors[field.field_name]
                            ? `${field.field_name}-error`
                            : undefined,
                        }}
                        inputRef={(el) => (inputRefs.current[field.field_name] = el)}
                        label={field.label}
                        name={field.field_name}
                        onChange={handleUserNameTextChange}
                        spellCheck="false"
                        value={values[field.field_name] || ''}
                      />
                    </div>
                  )}
                </SlideDown>
              ))}

              <SlideDown delay={getNextDelay()}>
                <Button
                  data-test="credentials-continue"
                  disabled={isProcessingMember}
                  fullWidth={true}
                  onClick={handleSubmit}
                  sx={{
                    marginBottom: tokens.Spacing.XSmall,
                  }}
                  type="submit"
                  variant="contained"
                >
                  {isProcessingMember ? __('Loading ...') : __('Continue')}
                </Button>
              </SlideDown>
            </form>
          ) : (
            <SlideDown delay={getNextDelay()}>
              <MessageBox title={__('Something went wrong')} variant="error">
                {__('There was a problem with this institution, try again later.')}
              </MessageBox>
            </SlideDown>
          )}

          <SlideDown delay={getNextDelay()}>
            <div style={styles.actionColumn}>
              {credentialRecovery()}
              {showDisconnectOption && (
                <Button
                  data-test="credentials-disconnect-button"
                  onClick={() => {
                    onDeleteConnectionClick()
                  }}
                  variant="text"
                >
                  {__('Disconnect this institution')}
                </Button>
              )}
              {showSupport && updateCredentials && (
                <Button
                  data-test="credentials-get-help-button"
                  onClick={() => {
                    sendAnalyticsEvent(AnalyticEvents.CREDENTIALS_CLICKED_GET_HELP, {
                      type: 'UPDATE',
                    })

                    setShowSupportView(true)
                  }}
                  variant="text"
                >
                  {__('Get help')}
                </Button>
              )}
            </div>
          </SlideDown>
        </Fragment>
        <AriaLive
          level="assertive"
          message={
            _isEmpty(errors) && isProcessingMember
              ? __('This process may take a while to finish') // Notify non-sighted users that creating a member process my take a while.
              : Object.values(errors)
                  .map((msg) => `${msg}, `)
                  .join()
          }
        />
      </StickyComponentContainer>
    )
  },
)

const getStyles = (tokens) => {
  return {
    headerText: {
      paddingBottom: tokens.Spacing.XSmall,
    },
    form: {
      paddingTop: tokens.Spacing.Medium,
    },
    input: {
      marginBottom: tokens.Spacing.Large,
    },
    inputError: {
      marginBottom: tokens.Spacing.Large,
      marginTop: tokens.Spacing.XSmall,
    },
    buttonBack: {
      marginTop: tokens.Spacing.Medium,
      marginBottom: '12px',
    },
    actionColumn: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: tokens.Spacing.Tiny,
    },
    text: {
      paddingLeft: tokens.Spacing.XSmall,
      color: tokens.Color.Primary300,
    },
    hr: {
      borderTop: `1px solid ${tokens.BackgroundColor.HrLight}`,
    },
    credentialsError: {
      marginTop: tokens.Spacing.Medium,
    },
  }
}

Credentials.propTypes = {
  credentials: PropTypes.array,
  error: PropTypes.object,
  handleSubmitCredentials: PropTypes.func.isRequired,
  isProcessingMember: PropTypes.bool,
  onDeleteConnectionClick: PropTypes.func,
  onGoBackClick: PropTypes.func.isRequired,
}

Credentials.displayName = 'Credentials'
