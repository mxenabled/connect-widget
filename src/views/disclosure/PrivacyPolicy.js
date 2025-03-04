import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { css } from '@mxenabled/cssinjs'

import { useTokens } from '@kyper/tokenprovider'
import { Text } from '@kyper/mui'
import { Link } from '@mui/material'

import { SlideDown } from 'src/components/SlideDown'
import { getDelay } from 'src/utilities/getDelay'
import { LeavingNoticeFlat } from 'src/components/LeavingNoticeFlat'

import useAnalyticsPath from 'src/hooks/useAnalyticsPath'
import { PageviewInfo } from 'src/const/Analytics'

import { isScrollableUrl, goToUrlLink } from 'src/utilities/global'
import privacyData from 'src/const/language/privacy_data'

// tags
const BOLD_TAG = 'b'
const H2_TAG = 'h2'
const A_TAG = 'a'
const LI_TAG = 'li'
const NON_KYPER_TAGS = ['ul', 'ol', LI_TAG, 'u']
const TEXT_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', BOLD_TAG]

export const PrivacyPolicy = () => {
  useAnalyticsPath(...PageviewInfo.CONNECT_DISCLOSURE_PRIVACY_POLICY)
  const [showLeavingNotice, setShowLeavingNotice] = useState(false)
  const showExternalLinkPopup = useSelector(
    (state) => state.profiles.clientProfile.show_external_link_popup,
  )

  const [currentUrl, setCurrentUrl] = useState(null)

  const getNextDelay = getDelay()
  const tokens = useTokens()
  const styles = getStyles(tokens)

  // This function handles the click of the link in the privacy policy
  const handleLinkClick = (url, isExternalUrl = true) => {
    const newUrl = { url, isExternalUrl }

    if (showExternalLinkPopup) {
      setShowLeavingNotice(true)
      setCurrentUrl(newUrl)
    } else {
      goToUrlLink(url, isExternalUrl)
    }
  }

  const buildElementJSX = (el, i) => {
    const tag = el.tag
    const style = el.style
    const children = el.text

    const buildChildrenJSX = (children) => {
      return children.map((child, i) => {
        if (typeof child === 'string') {
          return child
        }
        return buildElementJSX(child, i)
      })
    }

    if (typeof el === 'string') {
      return el
    } else if (tag === A_TAG) {
      return (
        <Link
          key={i}
          onClick={() => {
            if (isScrollableUrl(el.href)) {
              document.getElementById(el.href.split('#')[1]).scrollIntoView(true)
            } else {
              handleLinkClick(el.href)
            }
          }}
          role="link"
          style={styles.link}
        >
          {buildChildrenJSX(children)}
        </Link>
      )
    } else if (NON_KYPER_TAGS.includes(tag)) {
      const NonKyperTag = tag
      if (tag === LI_TAG) {
        return (
          <NonKyperTag className={css(styles[style])} key={i}>
            {buildChildrenJSX(children)}
          </NonKyperTag>
        )
      }
      return (
        <NonKyperTag key={i} style={style ? styles[style] : undefined}>
          {buildChildrenJSX(children)}
        </NonKyperTag>
      )
    } else if (TEXT_TAGS.includes(tag)) {
      return (
        <Text
          bold={tag === BOLD_TAG ? true : undefined}
          component={tag === BOLD_TAG ? undefined : tag}
          id={tag === H2_TAG ? el.id : undefined}
          key={i}
          style={style ? styles[style] : undefined}
          truncate={false}
          variant={tag === BOLD_TAG ? 'Paragraph' : undefined}
        >
          {buildChildrenJSX(children)}
        </Text>
      )
    }
    return null
  }

  return (
    <div>
      {showLeavingNotice ? (
        <SlideDown delay={getNextDelay()}>
          <LeavingNoticeFlat
            onCancel={() => {
              setShowLeavingNotice(false)
              setCurrentUrl(null)
            }}
            onContinue={() => {
              goToUrlLink(currentUrl.url, currentUrl.isExternalUrl)
              // reset current url back to null
              setCurrentUrl(null)
              setShowLeavingNotice(false)
            }}
          />
        </SlideDown>
      ) : (
        <React.Fragment>
          <SlideDown delay={getNextDelay()}>
            <div style={styles.header}>
              <Text component="h2" data-test="privacy-policy-header" truncate={false} variant="H2">
                {privacyData.title}
              </Text>
              <Text style={styles.lastUpdatedDate} truncate={false}>
                {privacyData.updatedOn}
              </Text>
            </div>
          </SlideDown>
          <SlideDown delay={getNextDelay()}>
            {privacyData.body.map((el, i) => buildElementJSX(el, i))}
          </SlideDown>
        </React.Fragment>
      )}
    </div>
  )
}
const getStyles = (tokens) => ({
  header: {
    display: 'flex',
    flexDirection: 'column',
  },
  lastUpdatedDate: {
    color: tokens.TextColor.Secondary,
    fontWeight: tokens.FontWeight.Normal,
    fontSize: tokens.FontSize.XSmall,
    lineHeight: tokens.LineHeight.Small,
    marginTop: tokens.Spacing.XSmall,
    marginBottom: tokens.Spacing.Medium,
  },
  title: {
    marginBottom: tokens.Spacing.XSmall,
  },
  subTitle: {
    marginBottom: tokens.Spacing.Medium,
    fontSize: tokens.FontSize.Body,
    lineHeight: tokens.LineHeight.Body,
  },
  paragraph: {
    marginBottom: tokens.Spacing.XSmall,
    fontSize: tokens.FontSize.ParagraphSmall,
    lineHeight: tokens.LineHeight.ParagraphSmall,
  },
  link: {
    display: 'inline',
    whiteSpace: 'normal',
    height: 'auto',
    fontSize: tokens.FontSize.Small,
    textAlign: 'left',
  },
  list: {
    listStylePosition: 'outside',
    marginTop: tokens.Spacing.Small,
  },
  listItem: {
    color: tokens.TextColor.Default,
    marginLeft: tokens.Spacing.XLarge,
    marginBottom: tokens.Spacing.XSmall,
    '& span': {
      fontSize: tokens.FontSize.ParagraphSmall,
      lineHeight: tokens.LineHeight.ParagraphSmall,
    },
  },
})
