import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import DOMPurify from 'dompurify'

import { Text } from '@mxenabled/mxui'

import { goToUrlLink } from 'src/utilities/global'
import styles from 'src/components/InstructionalText.module.css'

export const InstructionalText = ({
  instructionalText,
  setIsLeavingUrl,
  showExternalLinkPopup,
}) => {
  const sanitizedInstructionalText = DOMPurify.sanitize(instructionalText, {
    ALLOWED_TAGS: ['a'], // Only allow <a />
    ALLOWED_ATTR: ['href', 'id'], // Only allow href and id attributes
    ALLOWED_URI_REGEXP: new RegExp('^https?://.*'), // Only allow href to be http/https
  })

  const handleInstructionalTextClick = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (showExternalLinkPopup) {
      setIsLeavingUrl(e.target.href)
    } else {
      goToUrlLink(e.target.href)
    }
  }

  /**
   * This intercepts the link click in the instructional text to handle the leaving notice.
   */
  useEffect(() => {
    const instructionalLink = document.getElementById('instructional_text')

    if (!instructionalLink) return () => {}

    instructionalLink.addEventListener('click', handleInstructionalTextClick)

    return () => removeEventListener('click', handleInstructionalTextClick)
  }, [])

  return (
    <Text
      className={styles.text}
      component="p"
      dangerouslySetInnerHTML={{ __html: sanitizedInstructionalText }}
      data-test="instructional_text"
      truncate={false}
      variant="Paragraph"
    />
  )
}

InstructionalText.propTypes = {
  instructionalText: PropTypes.string.isRequired,
  setIsLeavingUrl: PropTypes.func.isRequired,
  showExternalLinkPopup: PropTypes.bool.isRequired,
}
