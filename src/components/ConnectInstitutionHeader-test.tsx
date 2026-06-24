import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from 'src/utilities/testingLibrary'
import { ConnectInstitutionHeader } from 'src/components/ConnectInstitutionHeader'
import { COLOR_SCHEME } from 'src/const/Connect'
import { initialState } from 'src/services/mockedData'

describe('ConnectInstitutionHeader', () => {
  const createPreloadedState = (colorScheme: string) => ({
    ...initialState,
    config: {
      ...initialState.config,
      color_scheme: colorScheme,
    },
  })

  it('renders light backdrop when color scheme is LIGHT', () => {
    const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
    render(<ConnectInstitutionHeader />, { preloadedState })

    expect(screen.getByTestId('backdrop-light')).toBeInTheDocument()
    expect(screen.queryByTestId('backdrop-dark')).not.toBeInTheDocument()
  })

  it('renders dark backdrop when color scheme is DARK', () => {
    const preloadedState = createPreloadedState(COLOR_SCHEME.DARK)
    render(<ConnectInstitutionHeader />, { preloadedState })

    expect(screen.getByTestId('backdrop-dark')).toBeInTheDocument()
    expect(screen.queryByTestId('backdrop-light')).not.toBeInTheDocument()
  })

  it('renders HeaderDevice', () => {
    const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
    render(<ConnectInstitutionHeader />, { preloadedState })

    expect(screen.getByTestId('device-svg')).toBeInTheDocument()
  })

  it('renders InstitutionLogo when institutionGuid is provided', () => {
    const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
    render(<ConnectInstitutionHeader institutionGuid="INS-12345" />, {
      preloadedState,
    })

    expect(screen.getByTestId('institution-logo')).toBeInTheDocument()
    expect(screen.queryByTestId('default-institution-icon')).not.toBeInTheDocument()
  })

  it('renders default institution icon when institutionGuid is not provided', () => {
    const preloadedState = createPreloadedState(COLOR_SCHEME.LIGHT)
    render(<ConnectInstitutionHeader />, { preloadedState })

    expect(screen.getByTestId('default-institution-icon')).toBeInTheDocument()
  })
})
