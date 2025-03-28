import React from 'react'
import { Text } from '@kyper/mui'
import { Container } from 'src/components/Container'

interface ConfigError {
  title: string
  message: string
  ressource?: string
  type: string
}
interface ConfigErrorProps {
  error: ConfigError
}

export const ConfigError: React.FC<ConfigErrorProps> = ({ error }) => {
  return (
    <Container>
      <div>
        <Text component={'h2'} truncate={false} variant="H2">
          {error.title}
        </Text>
        <Text component="p" truncate={false} variant="ParagraphSmall">
          {error.message}
        </Text>
      </div>
    </Container>
  )
}
