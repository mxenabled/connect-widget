/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@kyper/button'
import { Text } from '@kyper/text'
import { UtilityRow } from '@kyper/utilityrow'
import { InstitutionLogo } from '@kyper/institutionlogo'

import { __, _n } from 'src/utilities/Intl'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { startOauth, verifyExistingConnection } from 'src/redux/actions/Connect'
import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { GenericError } from 'src/components/GenericError'
import { useApi } from 'src/context/ApiContext'

interface VerifyExistingMemberProps {
  members: MemberType[]
  onAddNew: () => void
}

const VerifyExistingMember: React.FC<VerifyExistingMemberProps> = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_VERIFY_EXISTING_MEMBER)
  const { api } = useApi()
  const dispatch = useDispatch()
  const { members, onAddNew } = props
  const iavMembers = members.filter((member) => member.verification_is_enabled)
  const [selectedMember, setSelectedMember] = useState<MemberType | null>(null)
  const [{ isLoadingInstitution, institutionError }, setInstitution] = useState({
    isLoadingInstitution: false,
    institutionError: null,
  })

  const tokens = useTokens()

  const styles = getStyles(tokens)

  const handleMemberClick = (selectedMember: MemberType) => {
    setSelectedMember(selectedMember)
    setInstitution((state) => ({ ...state, isLoadingInstitution: true }))
  }

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
      <Text as="H3" data-test="verify-existing-member-header" style={styles.headerText}>
        {__('Select your institution')}
      </Text>
      <Text as="Paragraph" data-test="verify-existing-member-text" style={styles.primaryParagraph}>
        {__(
          'Choose an institution that’s already connected and select accounts to share, or search for a different one.',
        )}
      </Text>
      <Text
        as="ParagraphSmall"
        data-test="connected-institutions-text"
        style={styles.secondaryParagraph}
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
        variant="neutral"
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
    headerText: {
      marginBottom: tokens.Spacing.Tiny,
    },
    primaryParagraph: {
      marginBottom: tokens.Spacing.Large,
    },
    secondaryParagraph: {
      marginBottom: tokens.Spacing.XSmall,
      fontWeight: tokens.FontWeight.Semibold,
    },
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
