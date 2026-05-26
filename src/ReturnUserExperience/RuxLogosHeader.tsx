import React from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from 'src/redux/Store'

import { Stack } from '@mui/material'
import { Icon } from '@mxenabled/mxui'
import { MXLogoFilledIcon } from '@mxenabled/mxui'

import { ClientLogo } from 'src/components/ClientLogo'

export const RuxLogosHeader = ({ show }: { show?: boolean }) => {
  const clientGuid = useSelector((state: RootState) => state.profiles.client.guid)

  return show ? (
    <Stack direction="row" spacing="8px" sx={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Client Logo or Default */}
      <div style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <ClientLogo alt="Client logo" clientGuid={clientGuid} size={64} />
      </div>

      <Icon name="add" size={20} />

      {/* MX Logo */}
      <div
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MXLogoFilledIcon size={64} />
      </div>
    </Stack>
  ) : null
}

export default RuxLogosHeader
