import React from 'react'

import { useTokens } from '@kyper/tokenprovider'
import { AttentionFilled } from '@kyper/icon/AttentionFilled'

import { __ } from 'src/utilities/Intl'
import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

export const SearchFailed = () => {
  useAnalyticsPath(...PageviewInfo.CONNECT_SEARCH_FAILED)
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div style={styles.container}>
      <div style={styles.iconContainer}>
        <AttentionFilled color={tokens.Color.NeutralWhite} size={24} />
      </div>
      <div style={styles.textContainer}>
        <div style={styles.title}>{__('Search isn’t working')}</div>
        <div style={styles.subTitle}>{__('Something went wrong. Please try again.')}</div>
      </div>
    </div>
  )
}

const getStyles = (tokens) => {
  return {
    container: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      marginTop: tokens.Spacing.ContainerSidePadding,
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '48px',
      minWidth: '48px',
      marginRight: tokens.Spacing.Small,
      borderRadius: tokens.BorderRadius.Medium,
      backgroundColor: tokens.BackgroundColor.ButtonDestructive,
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column',
      marginTop: tokens.Spacing.Tiny,
    },
    title: {
      color: tokens.TextColor.Default,
      fontSize: tokens.FontSize.Body,
      fontWeight: tokens.FontWeight.Bold,
      lineHeight: tokens.LineHeight.ParagraphSmall,
    },
    subTitle: {
      color: tokens.TextColor.Default,
      fontSize: tokens.FontSize.Small,
      lineHeight: tokens.LineHeight.ParagraphSmall,
    },
  }
}
