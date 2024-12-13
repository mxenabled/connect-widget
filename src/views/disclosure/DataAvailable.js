import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'

import { PageviewInfo } from 'src/const/Analytics'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { getDataClusters } from 'src/const/DataClusters'

import { __ } from 'src/utilities/Intl'

import { SlideDown } from 'src/components/SlideDown'
import { DataCluster } from 'src/components/DataCluster'
import { getDelay } from 'src/utilities/getDelay'

export const DataAvailable = () => {
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE_DATA_AVAILABLE)
  const { dataClusters } = getDataClusters()
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const getNextDelay = getDelay()
  const appName = useSelector((state) => state.profiles.client.oauth_app_name || null)

  return (
    <Fragment>
      <SlideDown delay={getNextDelay()}>
        <div style={styles.container}>
          <Text component="h2" data-test="data-available-title" style={styles.title} variant="H2">
            {__('Data %1 may request', appName ? appName : __('your app'))}
          </Text>
          <div style={styles.paragraphContainer}>
            <Text
              component="p"
              data-test="data-available-subtitle"
              style={styles.paragraph}
              variant="Body"
            >
              {__(
                '%1 may request access to the following data at any time, only as needed, in order to support your requested products and services.',
                appName ? appName : __('Your app'),
              )}
            </Text>
          </div>
          {Object.values(dataClusters).map((cluster, i) => (
            <DataCluster dataCluster={cluster} key={i} />
          ))}
        </div>
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
      marginBottom: tokens.Spacing.Medium,
    },
    link: {
      fontWeight: tokens.FontWeight.Semibold,
      fontSize: tokens.FontSize.Small,
    },
    paragraphContainer: {
      marginBottom: tokens.Spacing.Large,
    },
  }
}

export default DataAvailable
