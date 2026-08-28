import React, { ReactNode } from 'react'
import { Box } from '@mui/material'
import { muiListItemButtonPadding } from '../theme/theme'

const negativeMargin = `${-1 * muiListItemButtonPadding}px`

export const FlushListContainer = ({ children }: { children: ReactNode }) => (
  <Box sx={{ marginLeft: negativeMargin, marginRight: negativeMargin }}>{children}</Box>
)
