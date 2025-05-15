/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { UtilityRow } from '@kyper/utilityrow'
import { InstitutionLogo } from '@kyper/institutionlogo'
import { Button } from '@mui/material'

import { __ } from 'src/utilities/Intl'
import { focusElement } from 'src/utilities/Accessibility'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'
import { startProfileOauth, verifyExistingProfileConnection } from 'src/redux/actions/Connect'
import { LoadingSpinner } from 'src/components/LoadingSpinner'
import { GenericError } from 'src/components/GenericError'
import { useApi } from 'src/context/ApiContext'
import { selectConfig } from 'src/redux/reducers/configSlice'
import { instutionSupportRequestedProducts } from 'src/utilities/Institution'

interface ListExistingMemberProps {
  members: MemberProfileResponseType[]
  onAddNew: () => void
}

const ListExistingMember: React.FC<ListExistingMemberProps> = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_VERIFY_EXISTING_MEMBER)
  const { api } = useApi()
  const config = useSelector(selectConfig)
  const dispatch = useDispatch()
  const { members, onAddNew } = props

  const [institutions, setInstitutions] = useState<Map<string, InstitutionResponseType>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [selectedMember, setSelectedMember] = useState<MemberProfileResponseType | null>(null)

  const tokens = useTokens()

  const styles = getStyles(tokens)

  const handleContinue = () => {
    if (selectedMember) {
      api
        .createUniversalMember(
          selectedMember.member_guid,
          selectedMember.profile_guid,
          selectedMember.guid,
        )
        .then(({ member: returnedMember }) => {
          const institution = institutions.get(selectedMember.institution_guid)
          if (institution) {
            if (returnedMember.is_oauth) {
              dispatch(startProfileOauth(returnedMember, institution))
            } else {
              dispatch(verifyExistingProfileConnection(returnedMember, institution))
            }
          }
        })
    }
  }

  const handleMemberClick = (selectedMember: MemberProfileResponseType) => {
    setSelectedMember(selectedMember)
  }

  useEffect(() => {
    focusElement(document.getElementById('connect-select-institution'))
  }, [])

  useEffect(() => {
    const fetchInstitutionsProgressively = async () => {
      setLoading(true)
      setError(null)

      const institutionMap = new Map<string, InstitutionResponseType>()

      for (const member of members) {
        try {
          const institution = await api.loadInstitutionByGuid(member.institution_guid)
          if (institution) {
            institutionMap.set(member.institution_guid, institution)
          }
        } catch (err) {
          setError(err as Error)
        }
      }

      setInstitutions(new Map(institutionMap))
      setLoading(false)
    }

    if (members.length > 0) {
      fetchInstitutionsProgressively()
    } else {
      setLoading(false)
    }
  }, [api, members])

  const productSupportingMembers = useMemo(() => {
    return members.filter((member) => {
      const institution = institutions.get(member.institution_guid)
      if (institution) {
        return instutionSupportRequestedProducts(config, institution)
      }
      return false
    })
  }, [config, institutions, members])

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
        {__('Select saved connection')}
      </Text>
      <Text
        data-test="verify-existing-member-text"
        sx={{ marginBottom: tokens.Spacing.Large }}
        truncate={false}
        variant="Paragraph"
      >
        {__('Choose a previously connected institution or add a new one.')}
      </Text>
      {productSupportingMembers.map((member) => {
        return (
          <UtilityRow
            borderType="none"
            data-test="connect-account-row"
            key={member.guid}
            leftChildren={
              <InstitutionLogo
                alt={member.member_name}
                aria-hidden={true}
                institutionGuid={member.institution_guid}
              />
            }
            onClick={() => handleMemberClick(member)}
            subTitle={member.institution_url}
            title={member.member_name}
          />
        )
      })}

      <Button fullWidth={true} onClick={handleContinue} style={styles.button} variant="contained">
        {__('Continue')}
      </Button>
      <Button
        fullWidth={true}
        onClick={() => {
          onAddNew()
        }}
        variant="text"
      >
        {__('Connect new institution')}
      </Button>
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
    button: {
      marginTop: tokens.Spacing.XLarge,
    },
  }
}

ListExistingMember.displayName = 'ListExistingMember'

export default ListExistingMember
