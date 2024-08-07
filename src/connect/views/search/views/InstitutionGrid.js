import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

import { InstitutionGridTile } from 'src/connect/components/InstitutionGridTile'
import { getTrueWidth } from 'reduxify/selectors/Browser'

import useAnalyticsEvent from 'src/connect/hooks/useAnalyticsEvent'
import { AuthenticationMethods } from 'src/connect/const/Analytics'

export const InstituionGrid = props => {
  const sendPosthogEvent = useAnalyticsEvent()
  const { handleSelectInstitution, institutions, posthogEvent } = props
  const trueWidth = useSelector(getTrueWidth)
  const clientUsesOauth = useSelector(state => state.profiles.clientProfile.uses_oauth ?? false)
  const width = trueWidth
  const fourColumns = width >= 360
  const styles = getStyles(fourColumns)

  return (
    <div style={styles.gridContainer}>
      {institutions.map((institution, i) => {
        return (
          <div key={`${i}-${institution.guid}`}>
            <InstitutionGridTile
              data-test={`${institution.name}-tile`}
              institution={institution}
              selectInstitution={() => {
                sendPosthogEvent(posthogEvent, {
                  authentication_method:
                    clientUsesOauth && institution.supports_oauth
                      ? AuthenticationMethods.OAUTH
                      : AuthenticationMethods.NON_OAUTH,
                  institution_guid: institution.guid,
                  institution_name: institution.name,
                })
                handleSelectInstitution(institution)
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

const getStyles = fourColumns => {
  return {
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: fourColumns ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)',
      maxWidth: '400px',
    },
  }
}

InstituionGrid.propTypes = {
  handleSelectInstitution: PropTypes.func.isRequired,
  institutions: PropTypes.array.isRequired,
  posthogEvent: PropTypes.string.isRequired,
}
