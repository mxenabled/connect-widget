import React from 'react'
import { Stack } from '@mui/material'
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
      <Stack alignItems="center" className={styles.container} spacing={3}>
        <Icon fill={true} name="error" size={32} />
        <Stack spacing={0.5}>
          <Text component="h2" truncate={false} variant="H2">
            {error.title}
          </Text>
          <Text component="p" truncate={false} variant="Paragraph">
            {error.message}
          </Text>
        </Stack>
      </Stack>
    </Container>
  )
}
