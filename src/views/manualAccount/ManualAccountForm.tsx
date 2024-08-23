import React, { MutableRefObject, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { from, of, zip, defer } from 'rxjs'
import { catchError, mergeMap, map } from 'rxjs/operators'
import _some from 'lodash/some'
import _startsWith from 'lodash/startsWith'

import Button from '@mui/material/Button'
import { Text } from '@kyper/text'
import { MessageBox } from '@kyper/messagebox'
import { useTokens } from '@kyper/tokenprovider'
import { TextInput, Select, SelectionBox } from 'src/privacy/input'

import _isEmpty from 'lodash/isEmpty'

import { __ } from 'src/utilities/Intl'
import { fadeOut } from 'src/utilities/Animation'
import connectAPI from 'src/services/api'
import { useForm } from 'src/hooks/useForm'
import { AccountTypeNames } from 'src/views/manualAccount/constants'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { addManualAccountSuccess } from 'src/redux/actions/Connect'

import { getMembers } from 'src/redux/selectors/Connect'
import { shouldShowConnectGlobalNavigationHeader } from 'src/redux/reducers/userFeaturesSlice'

import { getDelay } from 'src/utilities/getDelay'
import { getFormFields } from 'src/views/manualAccount/utils'
import { StyledAccountTypeIcon } from 'src/components/StyledAccountTypeIcon'
import { DayOfMonthPicker } from 'src/components/DayOfMonthPicker'
import { GoBackButton } from 'src/components/GoBackButton'
import { SlideDown } from 'src/components/SlideDown'
import { AriaLive } from 'src/components/AriaLive'

interface ManualAccountFormProps {
  accountType: number
  handleGoBack: () => void
  handleSuccess: () => void
}

interface keyable {
  [key: string]: any
}

export const ManualAccountForm = React.forwardRef<HTMLInputElement, ManualAccountFormProps>(
  (props, ref) => {
    const [name, path] = PageviewInfo.CONNECT_MANUAL_ACCOUNT_FORM
    useAnalyticsPath(name, path)
    const members = useSelector(getMembers)
    const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)
    const [saving, setSaving] = useState(false)
    const [isPersonal, setIsPersonal] = useState(true)
    const [showDayPicker, setShowDayPicker] = useState(false)
    const [returnField, setReturnField] = useState<string | null>(null)
    const [accountCreationError, setAccountCreationError] = useState(null)
    const dispatch = useDispatch()
    const tokens = useTokens()
    const styles = getStyles(tokens)
    const getNextDelay = getDelay()
    const fields = getFormFields(props.accountType)
    const formRef = ref as MutableRefObject<HTMLInputElement>
    const {
      handleTextInputChange,
      handleSubmit,
      values,
      errors,
    }: {
      // eslint-disable-next-line no-unused-vars
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
      if (!saving) return () => {}
      const createManualAccount$ = defer(() =>
        connectAPI.createAccount({
          ...values,
          account_type: props.accountType,
          is_personal: isPersonal,
        }),
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
              from(connectAPI.loadMemberByGuid(savedAccount.member_guid)),
              from(connectAPI.loadInstitutionByGuid(savedAccount.institution_guid)),
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

    // When opening the date picker, upon return the focus is back at the beginning of the
    // form. We set returnField to know which field to focus when we return. If there is no
    // return field, we focus on the first item in the form.
    const shouldFocus = (field: string, returnField: string | null, i: number) =>
      returnField ? returnField === field : i === 0

    if (showDayPicker) {
      return (
        <DayOfMonthPicker
          data-test="day-of-month-picker"
          handleClose={() => setShowDayPicker(false)}
          handleSelect={(e) => {
            handleTextInputChange(e)
            setShowDayPicker(false)
          }}
          name="day_payment_is_due"
        />
      )
    }

    return (
      <div ref={formRef}>
        <SlideDown delay={getNextDelay()}>
          {!showConnectGlobalNavigationHeader && (
            <GoBackButton
              handleGoBack={() => fadeOut(formRef?.current, 'up', 300).then(props.handleGoBack)}
            />
          )}
          <Text data-test="manual-account-form-header" style={styles.title} tag="h2">
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
                  <SelectionBox
                    checked={isPersonal}
                    id={'personal'}
                    label={__('Personal')}
                    name="accountType"
                    onChange={() => setIsPersonal(true)}
                    style={styles.selectBox}
                    value={'personal'}
                  />
                  <SelectionBox
                    checked={!isPersonal}
                    id={'business'}
                    label={__('Business')}
                    name="accountType"
                    onChange={() => setIsPersonal(false)}
                    style={styles.selectBox}
                    value={'business'}
                  />
                </div>
              )
            } else if (field.type === 'DateInput') {
              return (
                <div key={i} style={styles.dateInput}>
                  <TextInput
                    autoFocus={shouldFocus(field.name, returnField, i)}
                    data-test="date-input"
                    errorText={errors[field.name]}
                    label={field.label}
                    name={field.name}
                    onChange={() => {
                      setReturnField(field.name)
                      setShowDayPicker(true)
                    }}
                    onClick={() => {
                      setReturnField(field.name)
                      setShowDayPicker(true)
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
                  <TextInput
                    autoFocus={shouldFocus(field.name, returnField, i)}
                    data-test={`text-input-${field.name}`}
                    errorText={errors[field.name]}
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
                <Text as="Paragraph" data-test="something-went-wrong-text" role="alert" tag="p">
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
