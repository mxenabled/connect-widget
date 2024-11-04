import React from 'react'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Button } from '@mui/material'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { AnalyticEvents, PageviewInfo } from 'src/const/Analytics'

import { SlideDown } from 'src/components/SlideDown'

import { getDelay } from 'src/utilities/getDelay'
import { InstituionGrid } from 'src/views/search/views/InstitutionGrid'

export const PopularInstitutionsList = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCH_POPULAR)
  const {
    institutions,
    handleSelectInstitution,
    onAddManualAccountClick,
    onSearchInstitutionClick,
    enableManualAccounts,
  } = props

  const getNextDelay = getDelay()
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.listContainer}>
      <SlideDown delay={getNextDelay()}>
        <InstituionGrid
          handleSelectInstitution={handleSelectInstitution}
          institutions={institutions}
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
              onClick={onAddManualAccountClick}
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
  enableManualAccounts: PropTypes.bool.isRequired,
  handleSelectInstitution: PropTypes.func.isRequired,
  institutions: PropTypes.array.isRequired,
  onAddManualAccountClick: PropTypes.func.isRequired,
  onSearchInstitutionClick: PropTypes.func.isRequired,
}
