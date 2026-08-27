import React, { useImperativeHandle } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from 'src/redux/Store'
import { Button } from '@mui/material'
import { P, H2 } from '@mxenabled/mxui'
import { Icon } from '@mxenabled/mxui'

import { __, B } from 'src/utilities/Intl'
import { InstitutionLogo } from '@mxenabled/mxui'
import { SlideDown } from 'src/components/SlideDown'
import { getSelectedInstitution } from 'src/redux/selectors/Connect'
import * as connectActions from 'src/redux/actions/Connect'
import { selectInitialConfig } from 'src/redux/reducers/configSlice'
import styles from 'src/views/demoConnectGuard/DemoConnectGuard.module.css'

export type DemoConnectGuardProps = {
  showBackButton: () => boolean
}

export const DemoConnectGuard = React.forwardRef<DemoConnectGuardProps>(
  function DemoConnectGuard(_, ref) {
    const institution = useSelector(getSelectedInstitution)
    const initialConfig = useSelector(selectInitialConfig)
    const location = useSelector((state: RootState) => state.connect.location)

    const dispatch = useDispatch()

    useImperativeHandle(
      ref,
      () => ({
        showBackButton: () => location.length > 1,
      }),
      [location.length],
    )

    return (
      <div className={styles.container}>
        <SlideDown>
          <div className={styles.logoContainer}>
            <InstitutionLogo
              alt={__('Logo for %1', institution.name)}
              aria-hidden={true}
              institutionGuid={institution.guid}
              logoUrl={institution.logo_url}
              size={64}
            />
            <div className={styles.icon}>
              <Icon color="error" fill={true} name="error" size={32} />
            </div>
          </div>
          <H2 className={styles.title} truncate={false}>
            {__('Demo mode active')}
          </H2>
          <P className={styles.body} truncate={false}>
            <B>
              {__(
                'Live institutions are not available in the demo environment. Please select *MX Bank* to test the connection process.',
              )}
            </B>
          </P>
          <Button
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
  },
)
