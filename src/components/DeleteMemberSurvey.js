import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Icon, Text } from '@mxenabled/mxui'
import { MessageBox } from '@kyper/messagebox'
import { defer } from 'rxjs'
import FocusTrap from 'focus-trap-react'
import { Button, FormLabel, FormControl, Stack } from '@mui/material'
import { SelectionBox } from '@mxenabled/mxui'

import { SlideDown } from 'src/components/SlideDown'

import { __, _p } from 'src/utilities/Intl'
import { useApi } from 'src/context/ApiContext'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { ReadableStatuses } from 'src/const/Statuses'
import styles from 'src/components/DeleteMemberSurvey.module.css'

export const DELETE_REASONS = {
  NO_LONGER_USE_ACCOUNT: "I no longer use this account or it's not mine",
  DONT_WANT_SHARE_DATA: "I don't want to share my data",
  ACCOUNT_INFORMATION_OLD: 'The account information is old or inaccurate',
  UNABLE_CONNECT_ACCOUNT: 'I am unable to connect this account here',
  DONT_WANT_TO_USE_APP: "I don't want to use this app",
  DONT_WANT_ACCOUNT_CONNECTED: "I don't want this account connected here",
  OTHER_REASON: 'Other',
}

export const DeleteMemberSurvey = (props) => {
  const { isOpen, member, onClose, onMemberDeleted } = props
  const containerRef = useRef(null)
  useAnalyticsPath(...PageviewInfo.CONNECT_DELETE_MEMBER_SURVEY)
  const { api } = useApi()
  const [selectedReason, setSelectedReason] = useState(null)
  const [deleteMemberState, updateDeleteMemberState] = useState({
    loading: false,
    error: null,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const CONNECTED_REASONS = [
    __(DELETE_REASONS.NO_LONGER_USE_ACCOUNT),
    __(DELETE_REASONS.DONT_WANT_SHARE_DATA),
    __(DELETE_REASONS.DONT_WANT_TO_USE_APP),
    __(DELETE_REASONS.OTHER_REASON),
  ]
  const NON_CONECTED_REASONS = [
    __(DELETE_REASONS.UNABLE_CONNECT_ACCOUNT),
    __(DELETE_REASONS.ACCOUNT_INFORMATION_OLD),
    __(DELETE_REASONS.DONT_WANT_ACCOUNT_CONNECTED),
    __(DELETE_REASONS.OTHER_REASON),
  ]

  useEffect(() => {
    if (deleteMemberState.loading === false) return () => {}

    const request$ = defer(() => api.deleteMember(member)).subscribe(
      () => {
        onMemberDeleted(member.guid)
        onClose()
      },
      (err) => updateDeleteMemberState({ loading: false, error: err }),
    )

    return () => request$.unsubscribe()
  }, [deleteMemberState.loading, api, member, onMemberDeleted, onClose])

  if (!isOpen || !member) return null

  let reasonList

  if (member.connection_status !== ReadableStatuses.CONNECTED) {
    reasonList = NON_CONECTED_REASONS
  } else {
    reasonList = CONNECTED_REASONS
  }

  const hasDeleteError = deleteMemberState.loading === false && deleteMemberState.error != null

  const handleOnDisconnect = () => {
    // when the user selects to Disconnect the setIsSubmitted is set to true
    setIsSubmitted(true)
    //if there are is no selectedOption then the errors will show
    if (!selectedReason) {
      return false
    }
    return updateDeleteMemberState({ loading: true, error: null })
  }
  return (
    <FocusTrap focusTrapOptions={{ fallbackFocus: () => containerRef.current }}>
      <Stack
        className={styles.container}
        direction="row"
        justifyContent="center"
        ref={containerRef}
        role="dialog"
      >
        <Stack className={styles.modal}>
          {hasDeleteError ? (
            <SlideDown delay={100}>
              <Stack spacing={4}>
                <Stack spacing={1}>
                  <Text
                    component="h2"
                    data-test="disconnect-error-header"
                    truncate={false}
                    variant="H2"
                  >
                    {__('Something went wrong')}
                  </Text>
                  <MessageBox data-test="disconnect-error-message" variant="error">
                    <Text component="p" truncate={false} variant="ParagraphSmall">
                      {__(
                        "Oops! We weren't able to disconnect this institution. Please try again later.",
                      )}
                    </Text>
                  </MessageBox>
                </Stack>

                <Button
                  data-test="disconnect-ok-button"
                  fullWidth={true}
                  onClick={onClose}
                  variant="contained"
                >
                  {__('Ok')}
                </Button>
              </Stack>
            </SlideDown>
          ) : (
            <React.Fragment>
              <Stack spacing={0.5}>
                <Text truncate={false} variant="H2">
                  {__('Disconnect institution')}
                </Text>
                <FormControl>
                  <Stack spacing={2}>
                    <FormLabel id="disconnect-options-label">
                      <Text
                        component="p"
                        data-test="disconnect-disclaimer"
                        truncate={false}
                        variant="Paragraph"
                      >
                        {_p(
                          'connect/deletesurvey/disclaimer/text',
                          'Why do you want to disconnect %1?',
                          member.name,
                        )}
                        <span className={styles.asterisk}>*</span>
                      </Text>
                    </FormLabel>
                    <div>
                      {reasonList.map((reason, i) => (
                        <div key={reason}>
                          <SelectionBox
                            autoFocus={i === 0}
                            data-test={`selection-${reason.replace(/\s+/g, '-')}`}
                            data-testid="disconnect-option"
                            error={isSubmitted && !selectedReason}
                            inputProps={{
                              'aria-labelledby': 'disconnect-options-label',
                            }}
                            message={reason}
                            name="selected-reason"
                            onChange={(e) => setSelectedReason(e.target.value)}
                            selected={selectedReason === reason}
                            value={reason}
                          />
                        </div>
                      ))}
                    </div>
                  </Stack>
                </FormControl>

                <span className={styles.requiredNote}>
                  <span className={styles.requiredNoteAsterisk}>*</span> {__('Required')}
                </span>
              </Stack>

              {isSubmitted && !selectedReason && (
                <Stack
                  alignItems="center"
                  component="section"
                  direction="row"
                  role="alert"
                  spacing={0.5}
                >
                  <Icon color="error" fill={true} name="error" size={16} />
                  <Text color="error" component="p" truncate={false} variant="ParagraphSmall">
                    {__('Choose a reason for deleting')}
                  </Text>
                </Stack>
              )}
              <Stack className={styles.buttons} spacing={1}>
                <Button
                  color="error"
                  data-test="disconnect-button"
                  onClick={handleOnDisconnect}
                  variant="contained"
                >
                  {__('Disconnect')}
                </Button>

                <Button data-test="disconnect-cancel-button" onClick={onClose} variant={'text'}>
                  {__('Cancel')}
                </Button>
              </Stack>
            </React.Fragment>
          )}
        </Stack>
      </Stack>
    </FocusTrap>
  )
}

DeleteMemberSurvey.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  member: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onMemberDeleted: PropTypes.func.isRequired,
}
