/**
 * A function to use with our LeavingNoticeFlat component or any other component
 * to open a url link in a new tab window when it's clicked
 *
 * @param {string} url  url link to be opened in a new tab
 * @param {boolean} isExternalUrl  whether the url link is owned by us or not
 */
export const goToUrlLink = (url, isExternalUrl = false) => {
  let win = null

  if (url) {
    const newUrl = urlWithHttps(url)

    if (isExternalUrl) {
      win = window.open(newUrl, '_blank', 'noopener,noreferrer')
    } else {
      win = window.open(newUrl, '_blank')
    }
  }

  if (win) {
    win.focus()
  }
}

export const urlWithHttps = (url) => {
  // Change the string url into a URL object
  try {
    const newUrl = new URL(url)

    // Change the protocol of the URL object to https
    newUrl.protocol = 'https'

    // Return a string containing the whole url
    return newUrl.toString()
  } catch (error) {
    // Handles the case where the url is not a valid url(www.mx.com)
    return `https://${url}`
  }
}

export const isScrollableUrl = (url) => /^#/.test(url)

/**
 * Get the environment based on the location host.
 *
 * @return {Environments} The environment based on the location host.
 */
export const getEnvironment = () => {
  if (/\bsand\b/.test(window.location.host) || /\blocalhost\b/.test(window.location.host))
    return Environments.SANDBOX
  else if (/\bqa\b/.test(window.location.host)) return Environments.QA
  else if (/\bint\b/.test(window.location.host)) return Environments.INTEGRATION
  else return Environments.PRODUCTION
}

export const Environments = Object.freeze({
  SANDBOX: 'sandbox',
  QA: 'qa',
  INTEGRATION: 'integration',
  PRODUCTION: 'production',
})
