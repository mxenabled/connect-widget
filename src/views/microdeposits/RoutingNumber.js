import React, { useState, useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { defer } from 'rxjs'
import _isEmpty from 'lodash/isEmpty'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { Button } from '@kyper/button'
import { ChevronRight } from '@kyper/icon/ChevronRight'
import { TextInput } from 'src/privacy/input'

import { PageviewInfo } from 'src/const/Analytics'
import { AriaLive } from 'src/components/AriaLive'
import { __, _p } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { SharedRoutingNumber } from 'src/views/microdeposits/SharedRoutingNumber'
import { BLOCKED_REASONS } from 'src/views/microdeposits/const'
import { SlideDown } from 'src/components/SlideDown'
import { GoBackButton } from 'src/components/GoBackButton'
import { FindAccountInfo } from 'src/components/FindAccountInfo'
import { ActionableUtilityRow } from 'src/components/ActionableUtilityRow'
import { useForm } from 'src/hooks/useForm'
import { getDelay } from 'src/utilities/getDelay'
import { fadeOut } from 'src/utilities/Animation'
import connectAPI from 'src/services/api'

import { shouldShowConnectGlobalNavigationHeader } from 'src/redux/reducers/userFeaturesSlice'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'
import { PostMessageContext } from 'src/ConnectWidget'

const schema = {
  routingNumber: {
    label: __('Routing number'),
    required: true,
    pattern: 'digits',
    length: 9,
  },
}

export const RoutingNumber = (props) => {
  const { accountDetails, handleGoBack, onContinue, stepToIAV } = props
  const connectConfig = useSelector(selectConnectConfig)
  const includeIdentity = connectConfig?.include_identity ?? false
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)

  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_MICRODEPOSITS_ROUTING_NUMBER)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const postMessageFunctions = useContext(PostMessageContext)

  const [routingBlocked, setRoutingBlocked] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showFindDetails, setShowFindDetails] = useState(false)
  const [institutions, setInstitutions] = useState([])

  const initialForm = { routingNumber: accountDetails?.routing_number ?? '' }
  const { handleTextInputChange, handleSubmit, values, errors } = useForm(
    () => setSubmitting(true),
    schema,
    initialForm,
  )

  useEffect(() => {
    if (submitting) {
      const newAccountDetails = {
        ...accountDetails,
        routing_number: values.routingNumber,
      }

      const verifyRoutingNumber$ = defer(() =>
        connectAPI.verifyRoutingNumber(values.routingNumber, includeIdentity),
      ).subscribe(
        (resp) => {
          if (_isEmpty(resp)) {
            // If resp is empty, the routing number is not blocked.
            return handleContinue(newAccountDetails)
          } else {
            // Routing number blocked, send post message and handle logic.
            postMessageFunctions.onPostMessage('connect/microdeposits/blockedRoutingNumber', {
              routing_number: values.routingNumber,
              reason: resp.blocked_routing_number.reason_name,
            })

            // If reason is IAV_PREFERRED, load institutions to prepare for user choice.
            if (resp.blocked_routing_number.reason === BLOCKED_REASONS.IAV_PREFERRED) {
              const loadedInstitutions$ = defer(() =>
                connectAPI.loadInstitutions({
                  routing_number: values.routingNumber,
                  account_verification_is_enabled: true,
                  account_identification_is_enabled: includeIdentity,
                }),
              ).subscribe((searchedInstitutions) => {
                // If no institutions found, continue with MDV flow
                if (searchedInstitutions.length === 0) {
                  return handleContinue(newAccountDetails)
                } else {
                  setInstitutions(searchedInstitutions)
                  return setSubmitting(false)
                }
              })

              return () => loadedInstitutions$.unsubscribe()
            } else {
              setRoutingBlocked(__('Institution is not supported for microdeposit verification.'))
              return setSubmitting(false)
            }
          }
        },
        (err) => {
          setRoutingBlocked(
            __(
              'Unable to proceed. Please try again later. Error: %1',
              err?.response?.status || 'UNKNOWN',
            ),
          )
          setSubmitting(false)
        },
      )

      return () => verifyRoutingNumber$.unsubscribe()
    }

    return () => {}
  }, [submitting])

  const handleContinue = (newAccountDetails) =>
    fadeOut(containerRef.current, 'up', 300).then(() => onContinue(newAccountDetails))

  if (showFindDetails) {
    return <FindAccountInfo onClose={() => setShowFindDetails(false)} step="routingNumber" />
  }

  if (institutions.length > 0) {
    return (
      <SharedRoutingNumber
        continueMicrodeposits={() =>
          onContinue({
            ...accountDetails,
            routing_number: values.routingNumber,
          })
        }
        institutions={institutions}
        onGoBack={() => setInstitutions([])}
        routingNumber={values.routingNumber}
        selectInstitution={(institutionGuid) => stepToIAV(institutionGuid)}
      />
    )
  }

  return (
    <div ref={containerRef}>
      {!showConnectGlobalNavigationHeader && (
        <GoBackButton data-test="go-back-button" handleGoBack={handleGoBack} />
      )}

      <SlideDown delay={getNextDelay()}>
        <div style={styles.header}>
          <Text data-test="microdeposit-header" style={styles.title} tag="h2">
            {__('Enter routing number')}
          </Text>
        </div>
      </SlideDown>

      <form onSubmit={(e) => e.preventDefault()}>
        <SlideDown delay={getNextDelay()}>
          <div style={styles.inputStyle}>
            <TextInput
              autoComplete="off"
              autoFocus={true}
              data-test="routing-number-input"
              disabled={submitting}
              errorText={errors.routingNumber ?? routingBlocked}
              label={__('Routing number')}
              name="routingNumber"
              onChange={handleTextInputChange}
              value={values.routingNumber}
            />
          </div>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <Button
            aria-label={__('Continue to confirm details')}
            data-test="continue-button"
            disabled={submitting}
            onClick={handleSubmit}
            style={styles.button}
            type="submit"
            variant="primary"
          >
            {submitting ? `${_p('Verifying', 'Checking')}...` : __('Continue')}
          </Button>
        </SlideDown>

        <SlideDown delay={getNextDelay()}>
          <ActionableUtilityRow
            icon={<ChevronRight color={tokens.TextColor.ButtonLinkTertiary} size={16} />}
            onClick={() => setShowFindDetails(true)}
            text={__('Help finding your routing number')}
          />
        </SlideDown>

        <AriaLive level="assertive" message={_isEmpty(errors) ? '' : errors.routingNumber} />
        <AriaLive level="assertive" message={routingBlocked} />
      </form>
    </div>
  )
}

const getStyles = (tokens) => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    marginBottom: tokens.Spacing.Large,
  },
  inputStyle: {
    marginBottom: tokens.Spacing.XLarge,
  },
  button: {
    width: '100%',
    marginBottom: '12px',
  },
})

RoutingNumber.propTypes = {
  accountDetails: PropTypes.object,
  handleGoBack: PropTypes.func.isRequired,
  onContinue: PropTypes.func.isRequired,
  stepToIAV: PropTypes.func.isRequired,
}
