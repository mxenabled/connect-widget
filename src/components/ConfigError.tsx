import React from 'react'
import { Text } from '@kyper/mui'
import { Container } from 'src/components/Container'
import { __ } from 'src/utilities/Intl'

export const ConfigError = () => {
  return (
    <Container>
      <div>
        <Text component={'h2'} truncate={false} variant="H2">
          {__('Mode not enabled')}
        </Text>
        <Text component="p" truncate={false} variant="ParagraphSmall">
          {__(
            'This mode isn’t available in your current plan. Please contact your representative to explore options.',
          )}
        </Text>
      </div>
    </Container>
  )
}
