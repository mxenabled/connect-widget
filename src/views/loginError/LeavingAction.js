import React from 'react'
import PropTypes from 'prop-types'

// External dependencies
import { goToUrlLink } from 'src/utilities/global'
import { getInstitutionLoginUrl } from 'src/utilities/Institution'

import { LeavingNoticeFlat } from 'src/components/LeavingNoticeFlat'

export const LeavingAction = ({ institution, setIsLeaving, size }) => {
  return (
    <LeavingNoticeFlat
      onCancel={() => {
        setIsLeaving(false)
      }}
      onContinue={() => {
        const url = getInstitutionLoginUrl(institution)

        goToUrlLink(url)
      }}
      size={size}
    />
  )
}

LeavingAction.propTypes = {
  institution: PropTypes.object.isRequired,
  setIsLeaving: PropTypes.func.isRequired,
  size: PropTypes.string.isRequired,
}
