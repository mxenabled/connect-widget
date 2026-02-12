import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@mui/material'
import { P, H2 } from '@mxenabled/mxui'
import { Icon } from '@mxenabled/mxui'

import { __, B } from 'src/utilities/Intl'
import { InstitutionLogo } from '@mxenabled/mxui'
import { SlideDown } from 'src/components/SlideDown'
import { getSelectedInstitution } from 'src/redux/selectors/Connect'
import * as connectActions from 'src/redux/actions/Connect'
import { selectInitialConfig } from 'src/redux/reducers/configSlice'

export const DemoConnectGuard: React.FC = () => {
  const institution = useSelector(getSelectedInstitution)
  const initialConfig = useSelector(selectInitialConfig)
  const styles = getStyles()

  const dispatch = useDispatch()

  return (
    <div style={styles.container}>
      <SlideDown>
        <div style={styles.logoContainer}>
          <InstitutionLogo
            alt={__('Logo for %1', institution.name)}
            aria-hidden={true}
            institutionGuid={institution.guid}
            logoUrl={institution.logo_url}
            size={64}
          />
          <Icon color="error" fill={true} name="error" size={32} sx={styles.icon} />
        </div>
        <H2 sx={styles.title} truncate={false}>
          {__('Demo mode active')}
        </H2>
        <P sx={styles.body} truncate={false}>
          <B>
            {__(
              'Live institutions are not available in the demo environment. Please select *MX Bank* to test the connection process.',
            )}
          </B>
        </P>
        <Button
          data-test="return-to-search-button"
          fullWidth={true}
          onClick={() => {
            dispatch({
              type: connectActions.ActionTypes.DEMO_CONNECT_GUARD_RETURN_TO_SEARCH,
              payload: initialConfig,
            })
          }}
          variant="contained"
        >
          {__('Return to institution selection')}
        </Button>
      </SlideDown>
    </div>
  )
}

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
