import React, { useState, useRef, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { defer } from 'rxjs'
import _isEmpty from 'lodash/isEmpty'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { ChevronRight } from '@kyper/icon/ChevronRight'
import { TextField } from 'src/privacy/input'
import { Button } from '@mui/material'

import { PageviewInfo } from 'src/const/Analytics'
import { AriaLive } from 'src/components/AriaLive'
import { __, _p } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

import { SharedRoutingNumber } from 'src/views/microdeposits/SharedRoutingNumber'
import { BLOCKED_REASONS } from 'src/views/microdeposits/const'
import { SlideDown } from 'src/components/SlideDown'
import { FindAccountInfo } from 'src/components/FindAccountInfo'
import { ActionableUtilityRow } from 'src/components/ActionableUtilityRow'
import { useForm } from 'src/hooks/useForm'
import { getDelay } from 'src/utilities/getDelay'
import { fadeOut } from 'src/utilities/Animation'
import { useApi } from 'src/context/ApiContext'

import { selectConnectConfig } from 'src/redux/reducers/configSlice'
import { PostMessageContext } from 'src/ConnectWidget'

export const RoutingNumber = (props) => {
  const { accountDetails, onContinue, stepToIAV } = props
  const connectConfig = useSelector(selectConnectConfig)
  const includeIdentity = connectConfig?.include_identity ?? false
  const { api } = useApi()
  const schema = {
    routingNumber: {
      label: __('Routing number'),
      required: true,
      pattern: 'digits',
      length: 9,
    },
  }

  const containerRef = useRef(null)
  const routingNumberInputRef = useRef(null)
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
        api.verifyRoutingNumber(values.routingNumber, includeIdentity),
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
                api.loadInstitutions({
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

  useEffect(() => {
    if (institutions.length > 0) props.setShowSharedRoutingNumber(true)
  }, [institutions.length])

  useEffect(() => {
    if (errors.routingNumber) {
      routingNumberInputRef.current.focus()
    }
  }, [errors])

  const handleContinue = (newAccountDetails) =>
    fadeOut(containerRef.current, 'up', 300).then(() => onContinue(newAccountDetails))

  if (showFindDetails) {
    return <FindAccountInfo onClose={() => setShowFindDetails(false)} step="routingNumber" />
  }

  if (institutions.length > 0) {
    return (
      <SharedRoutingNumber
        continueMicrodeposits={() => {
          props.setShowSharedRoutingNumber(false)
          onContinue({
            ...accountDetails,
            routing_number: values.routingNumber,
          })
        }}
        institutions={institutions}
        onGoBack={() => {
          props.setShowSharedRoutingNumber(false)
          setInstitutions([])
        }}
        routingNumber={values.routingNumber}
        selectInstitution={(institutionGuid) => stepToIAV(institutionGuid)}
      />
    )
  }

  return (
    <div ref={containerRef}>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.header}>
          <Text
            component="h2"
            data-test="microdeposit-header"
            style={styles.title}
            truncate={false}
            variant="H2"
          >
            {__('Enter routing number')}
          </Text>
        </div>
      </SlideDown>

      <form onSubmit={(e) => e.preventDefault()}>
        <SlideDown delay={getNextDelay()}>
          <div>
            <TextField
              autoComplete="off"
              autoFocus={true}
              disabled={submitting}
              error={!!errors.routingNumber || !!routingBlocked}
              fullWidth={true}
              helperText={errors.routingNumber ?? routingBlocked}
              inputProps={{
                'data-test': 'routing-number-input',
                'aria-describedby': errors.routingNumber ? 'routingNumber-error' : undefined,
              }}
              inputRef={routingNumberInputRef}
              label={__('Routing number')}
              name="routingNumber"
              onChange={handleTextInputChange}
              required={true}
              value={values.routingNumber}
            />
          </div>
        </SlideDown>

        <div style={{ marginTop: 16, marginBottom: 32 }}>
          <span style={{ color: '#666', fontSize: 13 }}>
            <span style={{ color: '#E32727', fontSize: 13 }}>*</span> {__('Required')}
          </span>
        </div>

        <SlideDown delay={getNextDelay()}>
          <Button
            aria-label={__('Continue to confirm details')}
            data-test="continue-button"
            disabled={submitting}
            fullWidth={true}
            onClick={handleSubmit}
            style={styles.button}
            type="submit"
            variant="contained"
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
  button: {
    marginBottom: '12px',
  },
})

RoutingNumber.propTypes = {
  accountDetails: PropTypes.object,
  onContinue: PropTypes.func.isRequired,
  setShowSharedRoutingNumber: PropTypes.func.isRequired,
  stepToIAV: PropTypes.func.isRequired,
}
