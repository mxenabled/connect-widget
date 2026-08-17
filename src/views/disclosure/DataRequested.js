import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { Icon, Text } from '@mxenabled/mxui'
import { Link, Stack } from '@mui/material'

import { selectConnectConfig } from 'src/redux/reducers/configSlice'

import { PageviewInfo } from 'src/const/Analytics'
import { VERIFY_MODE, AGG_MODE } from 'src/const/Connect'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { getDataClusters } from 'src/const/DataClusters'
import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { DataCluster } from 'src/components/DataCluster'
import { getDelay } from 'src/utilities/getDelay'

import { VIEWS } from 'src/views/disclosure/Interstitial'
import styles from 'src/views/disclosure/DataRequested.module.css'

export const DataRequested = (props) => {
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE_DATA_REQUESTED)
  const {
    aggDataCluster,
    verificationDataCluster,
    verificationIdentityDataCluster,
    aggIdentityDataCluster,
  } = getDataClusters()
  const connectConfig = useSelector(selectConnectConfig)
  const getNextDelay = getDelay()
  const appName = useSelector((state) => state.profiles.client.oauth_app_name || null)

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
      <SlideDown delay={getNextDelay()}>
        <Stack className={styles.container} spacing={0.5}>
          <Text
            bold={true}
            component="h2"
            data-test="data-requested-title"
            truncate={false}
            variant="H2"
          >
            {__('Data requested by %1', appName ? appName : __('your app'))}
          </Text>
          <Text
            component="p"
            data-test="data-requested-subtitle"
            truncate={false}
            variant="ParagraphSmall"
          >
            {__(
              '%1 is requesting access to the following data at this time in order to support your requested products and services.',
              appName ? appName : __('Your app'),
            )}
          </Text>
        </Stack>
        {dataClusterElement}
        <Link
          className={styles.link}
          data-test="data-available-button"
          onClick={() => {
            props.setCurrentView(VIEWS.AVAILABLE_DATA)
          }}
          variant="ParagraphSmall"
        >
          {__('Other available data')}
          <Icon name="chevron_right" size={16} />
        </Link>
      </SlideDown>
    </Fragment>
  )
}

DataRequested.propTypes = {
  setCurrentView: PropTypes.func.isRequired,
}

export default DataRequested
