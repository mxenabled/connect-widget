import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { css } from '@mxenabled/cssinjs'

import { __ } from 'src/utilities/Intl'

import { useTokens } from '@kyper/tokenprovider'
import { InstitutionLogo } from '@kyper/mui'
import { Button } from '@mui/material'

import { getTrueWidth } from 'src/redux/selectors/Browser'

export const InstitutionGridTile = (props) => {
  const { institution, selectInstitution } = props
  const tokens = useTokens()
  const trueWidth = useSelector(getTrueWidth)
  const margin = tokens.Spacing.Large
  const width = trueWidth > 400 ? 400 : trueWidth
  const numColumns = width >= 360 ? 4 : 3
  const containerWidth =
    width >= 360 ? (width - margin) / numColumns : (width - margin) / numColumns
  const styles = getStyles(tokens, containerWidth)
  return (
    <Button
      aria-label={__('Add account with %1', institution.name)}
      className={css(styles.container)}
      data-test={`${institution.name.replace(/\s+/g, '-')}-tile`}
      onClick={selectInstitution}
      style={styles.container}
      sx={{
        '&:hover .iconTile': {
          boxShadow: '0px 0px 0px 4px rgba(238, 241, 246, 1)',
        },
        '&:focus .iconTile': {
          boxShadow: '0px 0px 0px 4px #2C64EF',
        },
        '&:focus': {
          boxShadow: 'none',
          border: 'none',
          outline: 'none',
        },
        '&:hover': {
          backgroundColor: 'transparent',
        },
      }}
      type="button"
    >
      <div style={styles.institutionBodyContainer}>
        <div className={'iconTile ' + css(styles.iconTile)} style={styles.iconTile}>
          <InstitutionLogo
            alt=""
            institutionGuid={institution.guid}
            logoUrl={institution.logo_url}
            size={containerWidth - 24}
          />
        </div>

        <div style={styles.textColumn}>
          <div style={styles.name}>{institution.name}</div>
        </div>
      </div>
    </Button>
  )
}

const getStyles = (tokens, width) => {
  return {
    container: {
      padding: `${tokens.Spacing.Tiny}px ${tokens.Spacing.Tiny}px 0px`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: `${width}px`,
      height: `${width + 28}px`,
    },
    institutionBodyContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: '8px',
      alignItems: 'center',
      gap: '8px',
      height: `${width - 8}px`,
      width: `${width - 8}px`,
    },
    iconTile: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: '8px',
    },
    textColumn: {
      height: tokens.Spacing.XLarge,
      width: `${width - 8}px`,
      display: 'flex',
      flexDirection: 'column',
    },
    name: {
      overflow: 'hidden',
      textAlign: 'center',
      textOverflow: 'ellipsis',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      fontSize: tokens.FontSize.XSmall,
      fontWeight: tokens.FontWeight.Bold,
      lineHeight: tokens.LineHeight.XSmall,
      color: tokens.TextColor.Default,
    },
  }
}

InstitutionGridTile.propTypes = {
  institution: PropTypes.object.isRequired,
  selectInstitution: PropTypes.func.isRequired,
}
