import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@mxenabled/mxui'

export const DataCluster = (props) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const dataCluster = props.dataCluster

  return (
    <Fragment>
      <Text
        data-test={`${dataCluster.dataTest}-title`}
        style={styles.subTitle}
        truncate={false}
        variant="Body"
      >
        {dataCluster.name}
      </Text>
      <Text
        component="p"
        data-test={`${dataCluster.dataTest}-subtitle`}
        style={styles.body}
        truncate={false}
        variant="Body"
      >
        {dataCluster.description}
      </Text>
    </Fragment>
  )
}

const getStyles = (tokens) => ({
  subTitle: {
    fontSize: tokens.FontSize.Body,
    fontWeight: tokens.FontWeight.Semibold,
    marginBottom: tokens.Spacing.Tiny,
  },
  body: {
    fontSize: tokens.FontSize.ParagraphSmall,
    fontWeight: tokens.FontWeight.Regular,
    marginBottom: tokens.Spacing.Medium,
  },
})

DataCluster.propTypes = {
  dataCluster: PropTypes.object.isRequired,
}
