import React from 'react'
import { Text } from '@mxenabled/mxui'
import { __ } from 'src/utilities/Intl'

interface PoweredByFooterProps {
  aggregator?: string
}

export const PoweredByFooter = ({ aggregator = 'MX' }: PoweredByFooterProps) => {
  const styles = getStyles()

  return (
    <div style={styles.container}>
      <Text color="text.secondary" variant="body2">
        {__('powered by ')}
        <Text component="span" fontWeight="semibold" variant="body2">
          {aggregator}
        </Text>
      </Text>
    </div>
  )
}

const getStyles = () => {
  return {
    container: {
      display: 'flex' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  }
}

PoweredByFooter.displayName = 'PoweredByFooter'
