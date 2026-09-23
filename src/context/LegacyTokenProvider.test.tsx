import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { light, dark } from '@mxenabled/design-tokens'
import { LegacyTokenProvider, THEMES, useTokens } from 'src/context/LegacyTokenProvider'

const TokenReader = () => {
  const tokens = useTokens()

  return (
    <div>
      <span data-test="body">{tokens.BackgroundColor.Body}</span>
      <span data-test="brand300">{tokens.Color.Brand300}</span>
    </div>
  )
}

describe('LegacyTokenProvider', () => {
  it('returns the light tokens by default without a provider', () => {
    render(<TokenReader />)

    expect(screen.getByTestId('body')).toHaveTextContent(light.BackgroundColor.Body)
  })

  it('provides the light tokens by default', () => {
    render(
      <LegacyTokenProvider>
        <TokenReader />
      </LegacyTokenProvider>,
    )

    expect(screen.getByTestId('body')).toHaveTextContent(light.BackgroundColor.Body)
  })

  it('provides the dark tokens when the dark theme is used', () => {
    render(
      <LegacyTokenProvider theme={THEMES.DARK}>
        <TokenReader />
      </LegacyTokenProvider>,
    )

    expect(screen.getByTestId('body')).toHaveTextContent(dark.BackgroundColor.Body)
  })

  it('applies token overrides', async () => {
    const tokenOverrides = { Color: { Brand300: '#123456' }, BackgroundColor: { Body: '#abcdef' } }

    render(
      <LegacyTokenProvider tokenOverrides={tokenOverrides}>
        <TokenReader />
      </LegacyTokenProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('brand300')).toHaveTextContent('#123456'))
    expect(screen.getByTestId('body')).toHaveTextContent('#abcdef')
  })
})
