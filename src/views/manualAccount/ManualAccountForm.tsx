/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { MutableRefObject, useEffect, useState, useRef, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { from, of, zip, defer } from 'rxjs'
import { catchError, mergeMap, map } from 'rxjs/operators'
import _some from 'lodash/some'
import _startsWith from 'lodash/startsWith'
import _isEmpty from 'lodash/isEmpty'

import Button from '@mui/material/Button'
import { Text } from '@mxenabled/mxui'
import { MessageBox } from '@kyper/messagebox'
import { useTokens } from '@kyper/tokenprovider'
import { Select, SelectionBox, TextField } from 'src/privacy/input'

import { __ } from 'src/utilities/Intl'
import { fadeOut } from 'src/utilities/Animation'
import { useForm } from 'src/hooks/useForm'
import { AccountTypeNames } from 'src/views/manualAccount/constants'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { addManualAccountSuccess } from 'src/redux/actions/Connect'

import { getMembers } from 'src/redux/selectors/Connect'

import { getDelay } from 'src/utilities/getDelay'
import { getFormFields } from 'src/views/manualAccount/utils'
import { StyledAccountTypeIcon } from 'src/components/StyledAccountTypeIcon'
import { DayOfMonthPicker } from 'src/components/DayOfMonthPicker'
import { SlideDown } from 'src/components/SlideDown'
import { AriaLive } from 'src/components/AriaLive'
import { useApi } from 'src/context/ApiContext'

interface ManualAccountFormProps {
  accountType: number
  handleSuccess: () => void
  setShowDayPicker: (value: boolean) => void
  showDayPicker: boolean
}

interface keyable {
  [key: string]: any
}

export const ManualAccountForm = React.forwardRef<HTMLInputElement, ManualAccountFormProps>(
  (props, ref) => {
    const [name, path] = PageviewInfo.CONNECT_MANUAL_ACCOUNT_FORM
    useAnalyticsPath(name, path)
    const { api } = useApi()
    const members = useSelector(getMembers)
    const clientLocale = useMemo(() => {
      return document.querySelector('html')?.getAttribute('lang') || 'en'
    }, [document.querySelector('html')?.getAttribute('lang')])
    const [saving, setSaving] = useState(false)
    const [isPersonal, setIsPersonal] = useState(true)
    const [returnField, setReturnField] = useState<string | null>(null)
    const [accountCreationError, setAccountCreationError] = useState(null)
    const dispatch = useDispatch()
    const tokens = useTokens()
    const styles = getStyles(tokens)
    const getNextDelay = getDelay()
    const fields = getFormFields(props.accountType)
    const formRef = ref as MutableRefObject<HTMLInputElement>
    const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
    const {
      handleTextInputChange,
      handleSubmit,
      values,
      errors,
    }: {
      handleTextInputChange: (e: React.ChangeEvent) => void
      handleSubmit: () => void
      values: keyable
      errors: keyable
    } = useForm(() => setSaving(true), createSchema(), createInitialForm())

    function createInitialForm() {
      const initialForm: keyable = {}

      fields.forEach((field) => {
        if (field.name !== 'is_personal') {
          initialForm[field.name] = ''
        }
      })

      return initialForm
    }

    function createSchema() {
      const schema: keyable = {}

      fields.forEach((field) => {
        if (field.name !== 'is_personal') {
          schema[field.name] = {
            label: field.label,
            required: field.validation?.required ?? false,
          }

          if (field.validation?.pattern) schema[field.name].pattern = field.validation.pattern
          if (field.validation?.max) schema[field.name].max = field.validation.max
          if (field.validation?.min) schema[field.name].min = field.validation.min
        }
      })

      return schema
    }

    useEffect(() => {
      const handleFocus = (event: FocusEvent) => {
        const focusedElement = event.target as HTMLElement | null

        if (formRef.current && focusedElement !== null) {
          const containerRect = formRef.current.getBoundingClientRect()
          const elementRect = focusedElement.getBoundingClientRect()

          // Get the height of the sticky header (if any)
          const stickyHeader = document.querySelector(
            '[data-test="navigation-header"]',
          ) as HTMLElement | null
          const stickyHeaderHeight = stickyHeader ? stickyHeader.offsetHeight : 0

          // Check if the focused element is above or below the visible area of the container
          if (
            elementRect.top < containerRect.top + stickyHeaderHeight || // Account for sticky header
            elementRect.bottom > containerRect.bottom
          ) {
            focusedElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            })

            // Adjust scroll position to account for sticky header
            if (stickyHeaderHeight > 0) {
              window.scrollBy(0, -stickyHeaderHeight)
            }
          }
        }
      }

      // Attach focus event listener
      formRef.current?.addEventListener('focusin', handleFocus)

      return () => {
        // Cleanup event listener
        formRef.current?.addEventListener('focusin', handleFocus as EventListener)
      }
    }, [formRef])

    useEffect(() => {
      if (!saving) return () => {}
      const createManualAccount$ = defer(() =>
        api.createAccount!({
          ...values,
          account_type: props.accountType,
          is_personal: isPersonal,
        } as AccountCreateType),
      )
        .pipe(
          mergeMap((savedAccount: any) => {
            const alreadyHasManualMember = _some(members, (member: { institution_guid: string }) =>
              _startsWith(member.institution_guid, 'INS-MANUAL'),
            )

            // If we already have a manual account member just update the account
            if (alreadyHasManualMember) {
              return of(addManualAccountSuccess(savedAccount))
            }

            // Otherwise go get the newly created account's member and institution
            return zip(
              from(api.loadMemberByGuid!(savedAccount.member_guid, clientLocale)),
              from(api.loadInstitutionByGuid(savedAccount.institution_guid)),
            ).pipe(
              map(([loadedMember, loadedInstitution]) => {
                return addManualAccountSuccess(savedAccount, loadedMember, loadedInstitution)
              }),
            )
          }),
          catchError((err) => {
            throw err
          }),
        )
        .subscribe(
          (action) => {
            setSaving(false)
            dispatch(action)
            fadeOut(formRef?.current, 'up', 300).then(props.handleSuccess)
          },
          (error) => {
            setSaving(false)
            setAccountCreationError(error)
          },
        )
      return () => createManualAccount$.unsubscribe()
    }, [saving])

    useEffect(() => {
      for (const field of fields) {
        if (errors[field.name]) {
          inputRefs.current[field.name]?.focus()
          break
        }
      }
    }, [errors])

    // When opening the date picker, upon return the focus is back at the beginning of the
    // form. We set returnField to know which field to focus when we return. If there is no
    // return field, we focus on the first item in the form.
    const shouldFocus = (field: string, returnField: string | null, i: number) =>
      returnField ? returnField === field : i === 0

    if (props.showDayPicker) {
      return (
        <DayOfMonthPicker
          data-test="day-of-month-picker"
          handleClose={() => props.setShowDayPicker(false)}
          handleSelect={(e: any) => {
            handleTextInputChange(e)
            props.setShowDayPicker(false)
          }}
          name="day_payment_is_due"
          ref={ref}
        />
      )
    }

    return (
      <div ref={formRef}>
        <SlideDown delay={getNextDelay()}>
          <Text
            component="h2"
            data-test="manual-account-form-header"
            style={styles.title}
            truncate={false}
            variant="H2"
          >
            <StyledAccountTypeIcon
              icon={props.accountType}
              iconSize={20}
              size={32}
              style={styles.icon}
            />
            {AccountTypeNames[props.accountType || 0]}
          </Text>
        </SlideDown>
        <SlideDown delay={getNextDelay()}>
          {fields.map((field, i) => {
            if (field.type === 'SelectionBox') {
              return (
                <div key={i} style={styles.selectBoxes}>
                  <div style={styles.selectBox}>
                    <SelectionBox
                      id={'personal'}
                      message={__('Personal')}
                      name="accountType"
                      onChange={() => setIsPersonal(true)}
                      selected={isPersonal}
                      value={'personal'}
                    />
                  </div>
                  <div style={styles.selectBox}>
                    <SelectionBox
                      id={'business'}
                      message={__('Business')}
                      name="accountType"
                      onChange={() => setIsPersonal(false)}
                      selected={!isPersonal}
                      value={'business'}
                    />
                  </div>
                </div>
              )
            } else if (field.type === 'DateInput') {
              return (
                <div key={i} style={styles.dateInput}>
                  <TextField
                    FormHelperTextProps={{ id: field.name + '-error' }}
                    autoFocus={shouldFocus(field.name, returnField, i)}
                    error={!!errors[field.name]}
                    fullWidth={true}
                    helperText={errors[field.name]}
                    id={field.name}
                    inputProps={{
                      'data-test': 'date-input',
                      'aria-describedby': errors[field.name] ? field.name + '-error' : undefined,
                    }}
                    inputRef={(el: HTMLInputElement | null) => (inputRefs.current[field.name] = el)}
                    label={field.label}
                    name={field.name}
                    onChange={() => {
                      setReturnField(field.name)
                      props.setShowDayPicker(true)
                    }}
                    onClick={() => {
                      setReturnField(field.name)
                      props.setShowDayPicker(true)
                    }}
                    value={values[field.name]}
                  />
                </div>
              )
            } else if (field.type === 'Select') {
              return (
                <div key={i} style={styles.selectInput}>
                  <Select
                    data-test="select-input"
                    errorText={errors[field.name]}
                    items={field.options}
                    label={field.label}
                    name={field.name}
                    onChange={handleTextInputChange}
                    placeholder={__('Select a value')}
                  />
                </div>
              )
            } else {
              return (
                <div key={i} style={styles.textInput}>
                  <TextField
                    FormHelperTextProps={{ id: field.name + '-error' }}
                    autoFocus={shouldFocus(field.name, returnField, i)}
                    error={!!errors[field.name]}
                    fullWidth={true}
                    helperText={errors[field.name]}
                    id={field.name}
                    inputProps={{
                      'data-test': `text-input-${field.name}`,
                      'aria-describedby': errors[field.name] ? field.name + '-error' : undefined,
                    }}
                    inputRef={(el: HTMLInputElement | null) => (inputRefs.current[field.name] = el)}
                    label={field.label}
                    name={field.name}
                    onChange={handleTextInputChange}
                    value={values[field.name]}
                  />
                </div>
              )
            }
          })}

          {accountCreationError && (
            <div>
              <MessageBox title={__('Something went wrong')} variant="error">
                <Text
                  component="p"
                  data-test="something-went-wrong-text"
                  role="alert"
                  truncate={false}
                  variant="Paragraph"
                >
                  {__('Please try saving your account again.')}
                </Text>
              </MessageBox>
            </div>
          )}
          <div>
            <Button
              data-test="save-manual-account-button"
              disabled={saving}
              onClick={handleSubmit}
              style={styles.saveButton}
              variant="contained"
            >
              {__('Save')}
            </Button>
          </div>
          {!_isEmpty(errors) && (
            <AriaLive
              level="assertive"
              message={Object.values(errors)
                .map((msg) => `${msg}, `)
                .join()}
            />
          )}
        </SlideDown>
      </div>
    )
  },
)

const getStyles = (tokens: any) => ({
  title: {
    display: 'flex',
    marginBottom: tokens.Spacing.Large,
    marginTop: tokens.Spacing.XSmall,
  },
  icon: {
    borderRadius: tokens.BorderRadius.Medium,
    marginRight: tokens.Spacing.Small,
  },
  selectBoxes: {
    display: 'flex',
    justifyContent: 'space-between',
    margin: `${tokens.Spacing.XLarge}px 0`,
  },
  selectBox: {
    width: '48%',
  },
  dateInput: {
    marginTop: tokens.Spacing.XLarge,
  },
  selectInput: {
    marginTop: tokens.Spacing.XLarge,
  },
  textInput: {
    marginTop: tokens.Spacing.XLarge,
  },
  saveButton: {
    marginTop: tokens.Spacing.Medium,
    width: '100%',
  },
})

ManualAccountForm.displayName = 'ManualAccountForm'
