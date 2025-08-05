import React, { useImperativeHandle } from 'react'
import { useSelector } from 'react-redux'
import { Button } from '@mui/material'
import { P, H2 } from '@mxenabled/mxui'
import { Icon, InstitutionLogo } from '@kyper/mui'

import { getSelectedInstitution } from 'src/redux/selectors/Connect'
import { __ } from 'src/utilities/Intl'
import { fadeOut } from 'src/utilities/Animation'
import { SlideDown } from 'src/components/SlideDown'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

type InstitutionDisabledProps = {
  onGoBackClick: () => void
}

type InstitutionDisabledImperative = {
  handleBackButton: () => void
}

export const InstitutionDisabled = React.forwardRef<
  InstitutionDisabledImperative,
  InstitutionDisabledProps
>(({ onGoBackClick }, navigationRef) => {
  const [name, path] = PageviewInfo.CONNECT_INSTITUTION_DISABLED
  const containerRef = React.useRef<HTMLDivElement>(null)
  const institution = useSelector(getSelectedInstitution)
  const styles = getStyles()
  useAnalyticsPath(name, path, {
    institution: institution.name,
    institution_guid: institution.guid,
  })

  useImperativeHandle(
    navigationRef,
    () => ({
      handleBackButton() {
        handleGoBack()
      },
    }),
    [],
  )

  const handleGoBack = () => fadeOut(containerRef.current, 'up', 300).then(() => onGoBackClick())

  return (
    <div ref={containerRef} style={styles.container}>
      <SlideDown>
        <div style={styles.logoContainer}>
          <InstitutionLogo
            alt={__('Logo for %1', institution.name)}
            aria-hidden={true}
            institutionGuid={institution.guid}
            logoUrl={institution.logo_url}
            size={64}
          />
          <Icon
            color="error"
            data-test="institution-disabled-icon"
            fill={true}
            name="error"
            size={32}
            sx={styles.icon}
          />
        </div>
        <H2 sx={styles.title} truncate={false}>
          {__('Free %1 Connections Are No Longer Available', institution.name)}
        </H2>
        <P sx={styles.body} truncate={false}>
          {__(
            '%1 now charges a fee for us to access your account data. To avoid passing that cost on to you, we no longer support %1 connections.',
            institution.name,
          )}
        </P>
        <Button data-test="done-button" fullWidth={true} onClick={handleGoBack} variant="contained">
          {__('Go back')}
        </Button>
      </SlideDown>
    </div>
  )
})

InstitutionDisabled.displayName = 'InstitutionDisabled'

const getStyles = () => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingTop: 20,
  } as React.CSSProperties,
  logoContainer: {
    position: 'relative',
    display: 'inline-block',
  } as React.CSSProperties,
  icon: {
    position: 'absolute',
    top: '-16px',
    right: '-16px',
    background: 'white',
    borderRadius: '50%',
  },
  title: {
    marginBottom: '4px',
    marginTop: '32px',
    fontSize: '23px',
    fontWeight: 700,
    lineHeight: '32px',
    textAlign: 'center',
  },
  body: {
    textAlign: 'center',
    marginBottom: '32px',
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: '24px',
  } as React.CSSProperties,
})
