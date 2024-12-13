import React from 'react'

import { __ } from 'src/utilities/Intl'
import PropTypes from 'prop-types'

import { getInstitutionLoginUrl } from 'src/utilities/Institution'
import { goToUrlLink } from 'src/utilities/global'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { ChevronRight } from '@kyper/icon/ChevronRight'
import { Link } from '@mui/material'

export const ImpededMemberError = ({
  institution,
  message,
  onRefreshClick,
  setIsLeaving,
  showExternalLinkPopup,
  title,
}) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.container}>
      <Text variant="H2">{title}</Text>
      <Text variant="Paragraph">{message}</Text>
      <div style={styles.content}>
        <div style={styles.iconWrapper}>
          <div style={styles.numberIcon}>1</div>
        </div>
        <div>
          <Text variant="Paragraph">
            {__("Log in to %1's website and resolve the issue.", institution.name)}
          </Text>
          <div style={styles.actionArea}>
            <Link
              onClick={() => {
                if (showExternalLinkPopup) {
                  setIsLeaving(true)
                } else {
                  const url = getInstitutionLoginUrl(institution)

                  goToUrlLink(url)
                }
              }}
            >
              {__('Visit website')}
            </Link>
            <ChevronRight color={tokens.Color.Primary300} />
          </div>
        </div>
      </div>
      <div style={styles.content}>
        <div style={styles.iconWrapper}>
          <div style={styles.numberIcon}>2</div>
        </div>
        <div>
          <Text variant="Paragraph">
            {__('Come back here and try to connect your account again.')}
          </Text>
          <div style={styles.actionArea}>
            <Link onClick={onRefreshClick}>{__('Try again')}</Link>
            <ChevronRight color={tokens.Color.Primary300} />
          </div>
        </div>
      </div>
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      display: 'flex',
      flexDirection: 'column',
    },
    content: {
      display: 'flex',
      flexDirection: 'row',
      marginTop: tokens.Spacing.Medium,
      marginBottom: tokens.Spacing.Medium,
    },
    iconWrapper: {
      marginRight: tokens.Spacing.Small,
    },
    numberIcon: {
      borderRadius: '50%',
      fontFamily: tokens.Font.Semibold,
      height: tokens.Spacing.Large,
      width: tokens.Spacing.Large,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: tokens.Color.Primary100,
    },
    actionArea: {
      display: 'flex',
      alignItems: 'center',
    },
  }
}

ImpededMemberError.propTypes = {
  institution: PropTypes.object.isRequired,
  message: PropTypes.string.isRequired,
  onRefreshClick: PropTypes.func.isRequired,
  setIsLeaving: PropTypes.func.isRequired,
  showExternalLinkPopup: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
}
