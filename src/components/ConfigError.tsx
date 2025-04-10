import React from 'react'
import { Text } from '@kyper/mui'
import { useTokens } from '@kyper/tokenprovider'
import { Container } from 'src/components/Container'
import { AttentionFilled } from '@kyper/icon/AttentionFilled'

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
  const tokens = useTokens()
  const styles = getStyles(tokens)
  return (
    <Container>
      <div style={styles.container}>
        <AttentionFilled color="#4D4D4D" size={32} style={styles.errorIcon} />
        <Text component={'h2'} style={styles.errorTitle} truncate={false} variant="H2">
          {error.title}
        </Text>
        <Text component="p" truncate={false} variant="Paragraph">
          {error.message}
        </Text>
      </div>
    </Container>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyCcontent: 'center',
    marginTop: '36px',
    textAlign: 'center',
  } as React.CSSProperties,
  errorTitle: {
    marginBottom: tokens.Spacing.Tiny,
  },
  errorIcon: {
    marginBottom: tokens.Spacing.Large,
  },
})
