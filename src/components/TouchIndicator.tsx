import React from 'react'
import { useTheme } from '@mui/material'

// The expectation is that this component renders a circular touch indicator
// and it should be positioned absolutely where needed by the parent component.
export const TouchIndicator: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  style,
  ...props
}) => {
  const theme = useTheme()
  const { hover, selected } = theme.palette.action

  const styles: React.CSSProperties = {
    position: 'absolute',
    height: '36px',
    width: '36px',
    background: `radial-gradient(circle, ${hover} 0%, ${selected} 100%)`,
    stroke: theme.palette.divider,
    filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.12))',
    strokeWidth: '1px',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '50%',
    ...style,
  }

  return <div aria-hidden="true" className="touch-indicator" style={styles} {...props} />
}
