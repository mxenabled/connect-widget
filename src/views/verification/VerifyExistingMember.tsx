/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { UtilityRow } from '@kyper/utilityrow'
import { InstitutionLogo } from '@kyper/institutionlogo'
import { Button } from '@mui/material'

import { __, _n } from 'src/utilities/Intl'
import { focusElement } from 'src/utilities/Accessibility'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { startOauth, verifyExistingConnection } from 'src/redux/actions/Connect'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { GenericError } from 'src/components/GenericError'
import { useApi } from 'src/context/ApiContext'

interface VerifyExistingMemberProps {
  members: MemberResponseType[]
  onAddNew: () => void
}

const VerifyExistingMember: React.FC<VerifyExistingMemberProps> = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_VERIFY_EXISTING_MEMBER)
  const { api } = useApi()
  const dispatch = useDispatch()
  const { members, onAddNew } = props
  const iavMembers = members.filter((member) => member.verification_is_enabled)
  const [selectedMember, setSelectedMember] = useState<MemberResponseType | null>(null)
  const [{ isLoadingInstitution, institutionError }, setInstitution] = useState({
    isLoadingInstitution: false,
    institutionError: null,
  })

  const tokens = useTokens()

  const styles = getStyles(tokens)

  const handleMemberClick = (selectedMember: MemberResponseType) => {
    setSelectedMember(selectedMember)
    setInstitution((state) => ({ ...state, isLoadingInstitution: true }))
  }

  useEffect(() => {
    focusElement(document.getElementById('connect-select-institution'))
  }, [])

  useEffect(() => {
    if (!isLoadingInstitution || !selectedMember) return

    api
      .loadInstitutionByGuid(selectedMember.institution_guid)
      .then((institution) => {
        if (selectedMember.is_oauth) {
          dispatch(startOauth(selectedMember, institution))
        } else {
          dispatch(verifyExistingConnection(selectedMember, institution))
        }
      })
      .catch((error) => {
        setInstitution((state) => ({
          ...state,
          isLoadingInstitution: false,
          institutionError: error,
        }))
      })
  }, [isLoadingInstitution, selectedMember])

  if (isLoadingInstitution) {
    return <LoadingSpinner showText={true} />
  }

  if (institutionError) {
    return (
      <GenericError
        onAnalyticPageview={() => {}}
        title={__('Oops! Something went wrong. Please try again later.')}
      />
    )
  }

  return (
    <div style={styles.container}>
      <Text
        data-test="verify-existing-member-header"
        id="connect-select-institution"
        sx={{ marginBottom: tokens.Spacing.Tiny }}
        truncate={false}
        variant="H2"
      >
        {__('Select your institution')}
      </Text>
      <Text
        data-test="verify-existing-member-text"
        sx={{ marginBottom: tokens.Spacing.Large }}
        truncate={false}
        variant="Paragraph"
      >
        {__(
          'Choose an institution that’s already connected and select accounts to share, or search for a different one.',
        )}
      </Text>
      <Text
        data-test="connected-institutions-text"
        sx={{ marginBottom: tokens.Spacing.XSmall, fontWeight: 600 }}
        truncate={false}
        variant="ParagraphSmall"
      >
        {_n(
          '%1 Connected institution',
          '%1 Connected institutions',
          iavMembers.length,
          iavMembers.length,
        )}
      </Text>
      {iavMembers.map((member) => {
        return (
          <UtilityRow
            borderType="none"
            data-test="connect-account-row"
            key={member.guid}
            leftChildren={
              <InstitutionLogo
                alt={member.name}
                aria-hidden={true}
                institutionGuid={member.institution_guid}
              />
            }
            onClick={() => handleMemberClick(member)}
            subTitle={member.institution_url}
            title={member.name}
          />
        )
      })}
      <Button
        data-test="search-more-inst-button"
        onClick={() => {
          onAddNew()
        }}
        style={styles.buttonSpacing}
        variant="outlined"
      >
        {__('Search more institutions')}
      </Button>
      <PrivateAndSecure />
    </div>
  )
}

const getStyles = (tokens: any) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
    } as React.CSSProperties,
    buttonSpacing: {
      marginTop: tokens.Spacing.Medium,
    },
  }
}

VerifyExistingMember.propTypes = {
  members: PropTypes.array.isRequired,
  onAddNew: PropTypes.func.isRequired,
}

VerifyExistingMember.displayName = 'VerifyExistingMember'

export default VerifyExistingMember
