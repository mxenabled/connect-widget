import React from 'react'
import { useTokens } from '@kyper/tokenprovider'

export const ProgressLine = ({
  isActive,
  isCentralLine,
}: {
  isActive: boolean
  isCentralLine?: boolean
}) => {
  const tokens = useTokens()
  const styles = {
    backLine: {
      width: isCentralLine ? '16px' : '100%',
      minWidth: isCentralLine ? `16px` : undefined,
      height: '2px',
      background: tokens.BackgroundColor.HrDark,
      borderRadius: '1px',
      zIndex: 10,
    },
    activeLine: {
      background: tokens.TextColor.Active,
    },
  }
  const lineStyle = isActive ? { ...styles.backLine, ...styles.activeLine } : { ...styles.backLine }

  return <div style={lineStyle} />
}
