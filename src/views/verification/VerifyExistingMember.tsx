/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'

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
import { selectConfig } from 'src/redux/reducers/configSlice'
import { instutionSupportRequestedProducts } from 'src/utilities/Institution'

interface VerifyExistingMemberProps {
  members: MemberResponseType[]
  onAddNew: () => void
}

const VerifyExistingMember: React.FC<VerifyExistingMemberProps> = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_VERIFY_EXISTING_MEMBER)
  const { api } = useApi()
  const config = useSelector(selectConfig)
  const dispatch = useDispatch()
  const { members, onAddNew } = props
  const iavMembers = members.filter(
    (member) => member.verification_is_enabled && member.is_managed_by_user, // Only show user-managed members that support verification
  )
  const [institutions, setInstitutions] = useState<Map<string, InstitutionResponseType>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const tokens = useTokens()

  const styles = getStyles(tokens)

  const handleMemberClick = useCallback(
    (selectedMember: MemberResponseType) => {
      const institution = institutions.get(selectedMember.institution_guid)
      if (institution) {
        if (selectedMember.is_oauth) {
          dispatch(startOauth(selectedMember, institution))
        } else {
          dispatch(verifyExistingConnection(selectedMember, institution))
        }
      }
    },
    [dispatch, institutions],
  )

  useEffect(() => {
    focusElement(document.getElementById('connect-select-institution'))
  }, [])

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const institutionPromises = iavMembers.map(async (member) => {
          const institution = await api.loadInstitutionByGuid(member.institution_guid)
          return { guid: member.institution_guid, institution }
        })

        const results = await Promise.all(institutionPromises)

        const institutionMap = new Map<string, InstitutionResponseType>()
        results.forEach(({ guid, institution }) => {
          if (institution) {
            institutionMap.set(guid, institution)
          }
        })
        setInstitutions(institutionMap)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    if (iavMembers.length > 0) {
      fetchInstitutions()
    } else {
      setLoading(false) // No members to load
    }
  }, [api, iavMembers])

  const productSupportingMembers = useCallback(() => {
    return iavMembers.filter((member) => {
      const institution = institutions.get(member.institution_guid)
      if (institution) {
        return instutionSupportRequestedProducts(config, institution)
      }
      return false
    })
  }, [config, institutions, iavMembers])

  if (loading) {
    return <LoadingSpinner showText={true} />
  }

  if (error) {
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
        aria-label={__('Select your institution')}
        component="h2"
        data-test="verify-existing-member-header"
        id="connect-select-institution"
        sx={{ marginBottom: tokens.Spacing.Tiny }}
        tabIndex={-1}
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
          productSupportingMembers().length,
          productSupportingMembers().length,
        )}
      </Text>
      {productSupportingMembers().map((member) => {
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
