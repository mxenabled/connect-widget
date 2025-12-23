import React from 'react'
import PropTypes from 'prop-types'
import { useTheme } from '@mui/material'
import { TouchIndicator } from 'src/components/TouchIndicator'

export const ExampleCheckbox: React.FC<
  React.HTMLAttributes<HTMLInputElement> & {
    pseudoFocusColor: string
    showTouchIndicator?: boolean
  }
> = ({ id, showTouchIndicator, pseudoFocusColor }) => {
  const theme = useTheme()
  const checkboxSize = '1em'

  return (
    <div aria-hidden="true" style={{ position: 'relative' }}>
      <input
        aria-hidden={true}
        className="example-checkbox"
        defaultChecked={true}
        id={'example-' + id}
        name={'example-name-' + id}
        style={{
          accentColor: theme.palette.text.primary,
          marginTop: '8px',
          marginBottom: '8px',
          marginRight: '12px',
          width: checkboxSize,
          height: checkboxSize,
        }}
        tabIndex={-1}
        type="checkbox"
      />
      {/* Position the touch indicator to be centered over the checkbox */}
      {showTouchIndicator && <TouchIndicator style={{ left: '-9px', top: '-4px' }} />}
      {/* If we are showing the psuedo touch indicator, also show the pseudo-focus for the checkbox */}
      {showTouchIndicator && (
        <div
          aria-hidden="true"
          style={{
            display: 'inline-block',
            height: `calc(${checkboxSize} + 2px)`,
            width: `calc(${checkboxSize} + 2px)`,
            border: `1px solid ${pseudoFocusColor}`,
            borderRadius: '3px',
            position: 'absolute',
            top: '6px',
            left: '2px',
          }}
        />
      )}
    </div>
  )
}

ExampleCheckbox.propTypes = {
  id: PropTypes.string,
}
