import React from 'react'
import PropTypes from 'prop-types'

interface keyable {
  [key: string]: any
}
interface Props {
  className: string
  ref: Element
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
export function withProtection(SensitiveComponent: React.FC<Props>) {
  /*
    PostHog (our analytics tool in 2023) allows us to NOT record events by adding ph-no-capture
    https://posthog.com/docs/integrate/client/js#tuning-autocapture <== mentions ph-no-capture
  */

  function ProtectedComponent({
    forwardedRef,
    className,
    allowCapture = false,
    ...otherProps
  }: {
    forwardedRef: Element
    className: string
    allowCapture: boolean
  }) {
    const PROTECTION_CLASS = 'ph-no-capture'

    const captureProps: keyable = {}
    let newClassName = className ? `${className} ${PROTECTION_CLASS}` : PROTECTION_CLASS
    if (allowCapture) {
      // Just apply whatever class was given, removing default protection.
      newClassName = className
      captureProps[UNMASK_ATTRIBUTE] = allowCapture
    }

    return (
      <SensitiveComponent
        className={newClassName}
        ref={forwardedRef}
        {...captureProps}
        {...otherProps}
      />
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
