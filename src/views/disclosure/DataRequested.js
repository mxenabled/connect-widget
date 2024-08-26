import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/text'
import { Button } from '@kyper/button'
import { ChevronRight } from '@kyper/icon/ChevronRight'

import { shouldShowConnectGlobalNavigationHeader } from 'src/redux/reducers/userFeaturesSlice'
import { selectConnectConfig } from 'src/redux/reducers/configSlice'

import { PageviewInfo } from 'src/const/Analytics'
import { VERIFY_MODE, AGG_MODE } from 'src/const/Connect'
import {
  aggDataCluster,
  verificationDataCluster,
  verificationIdentityDataCluster,
  aggIdentityDataCluster,
} from 'src/const/DataClusters'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { GoBackButton } from 'src/components/GoBackButton'
import { DataCluster } from 'src/components/DataCluster'
import { getDelay } from 'src/utilities/getDelay'

import { VIEWS } from 'src/views/disclosure/Interstitial'

export const DataRequested = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE_DATA_REQUESTED)
  const connectConfig = useSelector(selectConnectConfig)
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const appName = useSelector((state) => state.profiles.client.oauth_app_name || null)
  const showConnectGlobalNavigationHeader = useSelector(shouldShowConnectGlobalNavigationHeader)

  const mode = connectConfig.mode ?? AGG_MODE

  const IDENTITY_JOB = connectConfig.include_identity === true
  const IS_IN_AGG_MODE = mode === AGG_MODE
  const IS_IN_VERIFY_MODE = mode === VERIFY_MODE

  let dataClusterElement
  if (IS_IN_AGG_MODE && IDENTITY_JOB) {
    dataClusterElement = aggIdentityDataCluster.map((cluster, i) => {
      return <DataCluster dataCluster={cluster} key={i} />
    })
  } else if (IS_IN_AGG_MODE) {
    dataClusterElement = aggDataCluster.map((cluster, i) => {
      return <DataCluster dataCluster={cluster} key={i} />
    })
  } else if (IS_IN_VERIFY_MODE && IDENTITY_JOB) {
    dataClusterElement = verificationIdentityDataCluster.map((cluster, i) => {
      return <DataCluster dataCluster={cluster} key={i} />
    })
  } else if (IS_IN_VERIFY_MODE) {
    dataClusterElement = verificationDataCluster.map((cluster, i) => {
      return <DataCluster dataCluster={cluster} key={i} />
    })
  }

  return (
    <Fragment>
      {!showConnectGlobalNavigationHeader && (
        <GoBackButton handleGoBack={() => props.handleGoBack()} />
      )}
      <SlideDown delay={getNextDelay()}>
        <div style={styles.container}>
          <Text as="H2" data-test="data-requested-title" style={styles.title} tag="h2">
            {__('Data requested by %1', appName ? appName : __('your app'))}
          </Text>
          <Text as="Body" data-test="data-requested-subtitle" style={styles.paragraph} tag="p">
            {__(
              '%1 is requesting access to the following data at this time in order to support your requested products and services.',
              appName ? appName : __('Your app'),
            )}
          </Text>
        </div>
        {dataClusterElement}
        <Button
          data-test="data-available-button"
          onClick={() => {
            props.setCurrentView(VIEWS.AVAILABLE_DATA)
          }}
          style={styles.link}
          variant="link"
        >
          {__('Other available data')}
          <ChevronRight style={styles.chevron} />
        </Button>
      </SlideDown>
    </Fragment>
  )
}

const getStyles = (tokens) => {
  return {
    title: {
      fontSize: tokens.FontSize.H2,
      fontWeight: tokens.FontWeight.Bold,
      marginBottom: tokens.Spacing.Tiny,
    },
    paragraph: {
      fontSize: tokens.FontSize.ParagraphSmall,
      fontWeight: tokens.FontWeight.Regular,
      marginBottom: tokens.Spacing.XSmall,
    },
    container: {
      marginBottom: tokens.Spacing.Large,
    },
    link: {
      fontWeight: tokens.FontWeight.Semibold,
      fontSize: tokens.FontSize.Small,
    },
  }
}

DataRequested.propTypes = {
  handleGoBack: PropTypes.func.isRequired,
  setCurrentView: PropTypes.func.isRequired,
}

export default DataRequested
