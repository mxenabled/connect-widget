/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import PropTypes from 'prop-types'

interface keyable {
  [key: string]: any
}

const UNMASK_ATTRIBUTE = `data-ph-unmask`

export function maskInputFn(inputText: string, inputElement?: Element) {
  if (inputElement?.getAttribute(UNMASK_ATTRIBUTE) === 'true') {
    return inputText
  }

  return '*'.repeat(inputText.length)
}

/**
 *
 * @param {*} SensitiveComponent Any component that can accept className
 * @returns
 */
export function withProtection(SensitiveComponent: React.ElementType) {
  /*
    PostHog (our analytics tool in 2023) allows us to NOT record events by adding ph-no-capture
    https://posthog.com/docs/integrate/client/js#tuning-autocapture <== mentions ph-no-capture
  */

  function ProtectedComponent({
    forwardedRef,
    allowCapture = false,
    ...otherProps
  }: {
    forwardedRef: Element
    allowCapture: boolean
  }) {
    const PROTECTION_CLASS = 'ph-no-capture'

    const captureProps: keyable = {}
    if (allowCapture) {
      captureProps[UNMASK_ATTRIBUTE] = allowCapture
    }

    return (
      <div className={PROTECTION_CLASS}>
        <SensitiveComponent ref={forwardedRef} {...captureProps} {...otherProps} />
      </div>
    )
  }

  ProtectedComponent.propTypes = {
    allowCapture: PropTypes.bool,
    className: PropTypes.string,
    forwardedRef: PropTypes.any,
  }

  const refEnabledComponent = React.forwardRef<Element, any>((props, ref) => {
    return <ProtectedComponent forwardedRef={ref} {...props} />
  })

  refEnabledComponent.displayName = 'ProtectedComponent'
  return refEnabledComponent
}
