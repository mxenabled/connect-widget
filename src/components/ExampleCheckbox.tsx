import React from 'react'
import PropTypes from 'prop-types'
import { TouchIndicator } from 'src/components/TouchIndicator'
import styles from 'src/components/ExampleCheckbox.module.css'

export const ExampleCheckbox: React.FC<
  React.HTMLAttributes<HTMLInputElement> & {
    pseudoFocusColor: string
    showTouchIndicator?: boolean
  }
> = ({ id, showTouchIndicator, pseudoFocusColor }) => {
  return (
    <div aria-hidden="true" className={styles.container}>
      <input
        aria-hidden={true}
        className={`example-checkbox ${styles.checkbox}`}
        defaultChecked={true}
        id={'example-' + id}
        name={'example-name-' + id}
        tabIndex={-1}
        type="checkbox"
      />
      {/* Position the touch indicator to be centered over the checkbox */}
      {showTouchIndicator && <TouchIndicator style={{ left: '-8px', top: '-4px' }} />}
      {/* If we are showing the psuedo touch indicator, also show the pseudo-focus for the checkbox */}
      {showTouchIndicator && (
        <div
          aria-hidden="true"
          className={styles.pseudoFocus}
          // Border color is dynamic — it comes from the institution's brand color
          style={{ borderColor: pseudoFocusColor }}
        />
      )}
    </div>
  )
}

ExampleCheckbox.propTypes = {
  id: PropTypes.string,
}
