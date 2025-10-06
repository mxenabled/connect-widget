import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import _pick from 'lodash/pick'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'

import { selectCurrentMode } from 'src/redux/reducers/configSlice'
import { stepToAddManualAccount } from 'src/redux/actions/Connect'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { AnalyticEvents, PageviewInfo } from 'src/const/Analytics'
import useSelectInstitution from 'src/hooks/useSelectInstitution'
import { PostMessageContext } from 'src/ConnectWidget'

import { SlideDown } from 'src/components/SlideDown'

import { getDelay } from 'src/utilities/getDelay'
import { InstituionGrid } from 'src/views/search/views/InstitutionGrid'

export const PopularInstitutionsList = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCH_POPULAR)
  const { handleSelectInstitution } = useSelectInstitution()
  const postMessage = useContext(PostMessageContext)
  const { institutions, onSearchInstitutionClick } = props

  const getNextDelay = getDelay()
  const tokens = useTokens()
  const styles = getStyles(tokens)
  // Redux
  const dispatch = useDispatch()
  const enableManualAccounts = useSelector((state) => {
    const isManualAccountsEnabled = state.profiles.widgetProfile?.enable_manual_accounts
    const { isAggMode } = selectCurrentMode(state)
    const hasAtriumAPI = state.profiles.client?.has_atrium_api

    return isManualAccountsEnabled && isAggMode && !hasAtriumAPI
  })

  return (
    <div style={styles.listContainer}>
      <SlideDown delay={getNextDelay()}>
        <InstituionGrid
          handleSelectInstitution={(institution) => {
            postMessage.onPostMessage(
              'connect/selectedInstitution',
              _pick(institution, ['name', 'guid', 'url', 'code']),
            )

            // The institution doesn't have credentials until we request it again from server
            handleSelectInstitution(institution)
          }}
          institutions={institutions.filter((institution) => !institution.is_disabled_by_client)}
          posthogEvent={AnalyticEvents.SELECT_POPULAR_INSTITUTION}
        />
      </SlideDown>
      <hr aria-hidden={true} style={styles.horizontalLine} />

      <div style={styles.transparentButton}>
        <SlideDown delay={getNextDelay()}>
          <Button
            data-test="search-for-your-institution-button"
            onClick={onSearchInstitutionClick}
            variant={'text'}
          >
            {__('Search for your institution')}
          </Button>
        </SlideDown>
        {enableManualAccounts && (
          <SlideDown delay={getNextDelay()}>
            <Button
              data-test="add-account-manually-button"
              onClick={() => dispatch(stepToAddManualAccount())}
              variant={'text'}
            >
              {__('Add account manually')}
            </Button>
          </SlideDown>
        )}
      </div>
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    listContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: `-${tokens.Spacing.Small}px`,
      marginRight: `-${tokens.Spacing.Small}px`,
      overflowY: 'auto',
      overflowX: 'hidden',
      maxHeight: '100%',
      background: tokens.BackgroundColor.Container,
    },
    flexItem: {
      width: '100%',
    },
    title: {
      display: 'block',
      fontWeight: tokens.FontWeight.Bold,
      marginBottom: tokens.Spacing.Tiny,
      marginTop: tokens.Spacing.Large,
    },
    actionTile: {
      marginBottom: tokens.Spacing.Tiny,
    },
    transparentButton: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '8px',
    },
    horizontalLine: {
      margin: tokens.Spacing.Small,
      alignSelf: 'stretch',
    },
  }
}

PopularInstitutionsList.propTypes = {
  institutions: PropTypes.array.isRequired,
  onSearchInstitutionClick: PropTypes.func.isRequired,
}
