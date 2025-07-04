import React, { useRef, useState, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useTokens } from '@kyper/tokenprovider'

import { SupportMenu } from 'src/components/support/SupportMenu'
import { RequestInstitution } from 'src/components/support/RequestInstitution'
import { GeneralSupport } from 'src/components/support/GeneralSupport'
import { SupportSuccess } from 'src/components/support/SupportSuccess'
import { AriaLive } from 'src/components/AriaLive'
import { fadeOut } from 'src/utilities/Animation'

export const VIEWS = {
  MENU: 'menu',
  REQ_INSTITUTION: 'reqInstitution',
  GENERAL_SUPPORT: 'generalSupport',
  SUCCESS: 'success',
}

export const Support = React.forwardRef((props, supportNavRef) => {
  const { loadToView, onClose } = props
  const [currentView, setCurrentView] = useState(loadToView)
  const [email, setEmail] = useState('')
  const [ariaLiveRegionMessage, setAriaLiveRegionMessage] = useState('')
  const user = useSelector((state) => state.profiles.user)
  const menuRef = useRef(null)
  const requestInstitutionRef = useRef(null)
  const generalSupportRef = useRef(null)
  const supportSuccessRef = useRef(null)
  const tokens = useTokens()
  const styles = getStyles(tokens)

  useImperativeHandle(supportNavRef, () => {
    return {
      handleCloseSupport() {
        if (loadToView !== VIEWS.MENU) {
          if (currentView === VIEWS.REQ_INSTITUTION) {
            handleCloseSupport(requestInstitutionRef)
          } else if (currentView === VIEWS.GENERAL_SUPPORT) {
            handleCloseSupport(generalSupportRef)
          } else if (currentView === VIEWS.SUCCESS) {
            handleCloseSupport(supportSuccessRef)
          }
        } else if (loadToView === VIEWS.MENU && currentView !== VIEWS.MENU) {
          setCurrentView(VIEWS.MENU)
        } else {
          handleCloseSupport(menuRef)
        }
      },
    }
  }, [currentView, loadToView])

  const handleCloseSupport = (refToClose) =>
    fadeOut(refToClose.current, 'up', 300).then(() => onClose())

  const handleTicketSuccess = (email) => {
    setEmail(email)
    setCurrentView(VIEWS.SUCCESS)
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {currentView === VIEWS.MENU && (
          <SupportMenu
            ref={menuRef}
            selectGeneralSupport={() => setCurrentView(VIEWS.GENERAL_SUPPORT)}
            selectRequestInstitution={() => setCurrentView(VIEWS.REQ_INSTITUTION)}
          />
        )}

        {currentView === VIEWS.REQ_INSTITUTION && (
          <RequestInstitution
            handleClose={() =>
              loadToView !== VIEWS.MENU
                ? handleCloseSupport(requestInstitutionRef)
                : setCurrentView(VIEWS.MENU)
            }
            handleTicketSuccess={handleTicketSuccess}
            ref={requestInstitutionRef}
            user={user}
          />
        )}

        {currentView === VIEWS.GENERAL_SUPPORT && (
          <GeneralSupport
            handleClose={() =>
              loadToView !== VIEWS.MENU
                ? handleCloseSupport(generalSupportRef)
                : setCurrentView(VIEWS.MENU)
            }
            handleTicketSuccess={handleTicketSuccess}
            ref={generalSupportRef}
            user={user}
          />
        )}

        {currentView === VIEWS.SUCCESS && (
          <SupportSuccess
            email={email}
            handleClose={() =>
              loadToView !== VIEWS.MENU
                ? handleCloseSupport(supportSuccessRef)
                : setCurrentView(VIEWS.MENU)
            }
            ref={supportSuccessRef}
            setAriaLiveRegionMessage={setAriaLiveRegionMessage}
          />
        )}
      </div>
      <AriaLive level="assertive" message={ariaLiveRegionMessage} />
    </div>
  )
})

const getStyles = (tokens) => ({
  container: {
    backgroundColor: tokens.BackgroundColor.Container,
    minHeight: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  content: {
    maxWidth: '400px', // Our max content width (does not include side margin)
    minWidth: '270px', // Our min content width (does not include side margin)
    width: '100%', // We want this container to shrink and grow between our min-max
    margin: '0 auto 0 auto',
  },
})

Support.propTypes = {
  loadToView: PropTypes.oneOf([VIEWS.MENU, VIEWS.REQ_INSTITUTION, VIEWS.GENERAL_SUPPORT]),
  onClose: PropTypes.func.isRequired,
}
Support.defaultPops = {
  loadToView: VIEWS.MENU,
}

Support.displayName = 'Support'
