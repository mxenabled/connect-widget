import React from 'react'
import { Stack } from '@mui/material'
import { Icon, Text } from '@mxenabled/mxui'
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
      <Stack alignItems="center" gap={3} mt="36px" textAlign="center">
        <Icon fill={true} name="error" size={32} />
        <Stack gap={0.5}>
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
