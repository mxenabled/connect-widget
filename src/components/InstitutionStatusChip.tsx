import React from 'react'
import { Chip, PaletteColor, useTheme } from '@mui/material'
import { useTokens } from '@kyper/tokenprovider'
import { InstitutionStatusType } from 'src/utilities/institutionStatus'

function InstitutionStatusChip({
  institutionStatus,
}: {
  institutionStatus: InstitutionStatusType
}) {
  const tokens = useTokens()
  const styles = getStyles(tokens)
  const theme = useTheme()

  const institutionStatusToChipColorMap = {
    OPERATIONAL: 'success', // OPERATIONAL is a success, but current we don't show the chip for this status
    CLIENT_BLOCKED_FOR_FEES: 'secondary',
    UNAVAILABLE: 'error',
    UNSUPPORTED: 'error',
  } as const satisfies Record<
    InstitutionStatusType,
    'error' | 'info' | 'secondary' | 'success' | 'warning'
  >

  const institutionStatusToLabelMap = {
    OPERATIONAL: '',
    CLIENT_BLOCKED_FOR_FEES: 'DISABLED', // We have not yet designed this label in our new designs so we'll keep it for now
    UNAVAILABLE: 'UNAVAILABLE',
    UNSUPPORTED: 'UNSUPPORTED',
  } as const satisfies Record<InstitutionStatusType, string>

  const chipStatus = institutionStatusToChipColorMap[institutionStatus] || 'secondary'
  const backgroundColor =
    (theme.palette?.[chipStatus] as PaletteColor & { [key: string]: string })?.['100'] ||
    theme.palette?.[chipStatus]?.main
  const color =
    (theme.palette?.[chipStatus] as PaletteColor & { [key: string]: string })?.['700'] ||
    theme.palette?.[chipStatus]?.main
  const label = institutionStatusToLabelMap[institutionStatus] || ''

  // We don't show the chip for OPERATIONAL status, so we return null here to avoid rendering an empty chip.
  if (institutionStatus === 'OPERATIONAL') {
    return null
  }

  return (
    <Chip
      color={chipStatus}
      label={label}
      size="small"
      sx={{
        ...styles.chip,
        backgroundColor, // Remove when on future mxui version that gets the design's theme colors
        color, // Remove when on future mxui version that gets the design's theme colors
      }}
    />
  )
}

const getStyles = (tokens: ReturnType<typeof useTokens>) => ({
  chip: {
    padding: `${tokens.Spacing.XTiny}px 0`,
    height: tokens.Spacing.Medium,
    fontSize: '9px',
  },
})

export default InstitutionStatusChip
export { InstitutionStatusChip }
