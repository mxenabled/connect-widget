import React from 'react'
import { Icon, Text } from '@mxenabled/mxui'
import { Container } from 'src/components/Container'
import styles from 'src/components/ConfigError.module.css'

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
      <div className={styles.container}>
        <Icon fill={true} name="error" size={32} sx={{ mb: 3 }} />
        <Text component="h2" sx={{ mb: 0.5 }} truncate={false} variant="H2">
          {error.title}
        </Text>
        <Text component="p" truncate={false} variant="Paragraph">
          {error.message}
        </Text>
      </div>
    </Container>
  )
}
