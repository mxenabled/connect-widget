import React from 'react'
import PropTypes from 'prop-types'

import { __ } from 'src/utilities/Intl'

import { useTokens } from '@kyper/tokenprovider'

import { ChevronRight } from '@kyper/icon/ChevronRight'
import { Button } from '@mui/material'
import { InstitutionLogo } from '@kyper/mui'

import { formatUrl } from 'src/utilities/FormatUrl'

export const InstitutionTile = (props) => {
  const { institution, selectInstitution, size } = props

  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <Button
      aria-label={__('Add account with %1', institution.name)}
      className={'institutionButton '}
      data-test={`${institution.name.replace(/\s+/g, '-')}-row`}
      endIcon={<ChevronRight color={tokens.TextColor.Default} height={16} width={16} />}
      fullWidth={true}
      onClick={selectInstitution}
      startIcon={
        <InstitutionLogo
          alt=""
          aria-hidden={true}
          institutionGuid={institution.guid}
          logoUrl={institution.logo_url}
          size={size}
        />
      }
      style={styles.container}
      sx={{
        '&:hover': {
          background: tokens.BackgroundColor.TableRowHover,
          cursor: 'pointer',
          zIndex: 100,
        },
        '&:focus': {
          outline: `1px solid ${tokens.BorderColor.InputFocus}`,
          // We offset the outline by a negative 1px so that
          // It's placed exactly at the border edge of the element.
          outlineOffset: '-1px',
          boxShadow: 'none',
        },
        '&:active': {
          border: `1px solid ${tokens.BorderColor.InputFocus}`,
        },
        '& .MuiButton-endIcon': {
          visibility: 'hidden',
          marginLeft: 'auto',
          width: '25px',
          overflow: 'hidden',
          alignSelf: 'center',
        },
        '&:hover .MuiButton-endIcon': {
          visibility: 'visible',
        },
      }}
    >
      <div style={styles.textColumn}>
        <div style={styles.name}>{institution.name}</div>
        <div style={styles.url}>{formatUrl(institution.url)}</div>
      </div>
    </Button>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      height: '72px',
      // Because we are having to account for border size too, tokens doesnt contain the right size
      padding: '12px',
      display: 'flex',
      position: 'relative',
      flexDirection: 'row',
      borderRadius: tokens.BorderRadius.CardRounded,
      boxSizing: 'border-box',
      alignItems: 'center',
      width: '100%',
      zIndex: 1,
    },
    institutionBodyContainer: {
      width: '100%',
      alignSelf: 'center,',
      display: 'flex',
      alignItems: 'center',
    },
    textColumn: {
      width: '70%',
      overflow: 'hidden',
      alignSelf: 'center',
      paddingLeft: '12px',
    },
    iconColumn: {
      marginRight: tokens.Spacing.Small,
      display: 'flex',
      flexDirection: 'column',
    },
    name: {
      textAlign: 'left',
      color: tokens.TextColor.Default,
      fontSize: tokens.FontSize.Button,
      lineHeight: tokens.LineHeight.ParagraphSmall,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      fontWeight: tokens.FontWeight.Bold,
      marginBottom: tokens.Spacing.Tiny,
    },
    url: {
      textAlign: 'left',
      color: tokens.TextColor.Secondary,
      fontWeight: tokens.FontWeight.Normal,
      fontSize: tokens.FontSize.ButtonLinkSmall,
      lineHeight: tokens.LineHeight.Small,
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
    },
  }
}

InstitutionTile.propTypes = {
  institution: PropTypes.object.isRequired,
  selectInstitution: PropTypes.func.isRequired,
  size: PropTypes.number,
}
