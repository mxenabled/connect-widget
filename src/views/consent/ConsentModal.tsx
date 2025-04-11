import React, { Dispatch, SetStateAction } from 'react'

import { Text, DialogFooter } from '@kyper/mui'
import { Box, Dialog, DialogContent, DialogTitle } from '@mui/material'
import { __ } from 'src/utilities/Intl'
import { goToUrlLink } from 'src/utilities/global'

interface ConsentModalProps {
  dialogIsOpen: boolean
  setDialogIsOpen: Dispatch<SetStateAction<boolean>>
}

export const ConsentModal: React.FC<ConsentModalProps> = ({ dialogIsOpen, setDialogIsOpen }) => {
  const styles = getStyles()

  return (
    <Dialog onClose={() => setDialogIsOpen((prev) => !prev)} open={dialogIsOpen} sx={styles.dialog}>
      <DialogTitle variant="h2">{__('Who is MX Technologies?')}</DialogTitle>
      <DialogContent>
        <Text component="p" sx={{ marginBottom: '24px' }} truncate={false} variant="Paragraph">
          {__(
            'MX is a trusted financial data platform that securely connects your accounts. It follows strict security and privacy standards to keep your information safe.',
          )}
        </Text>
        <Text component="p" fontWeight="600" variant="Paragraph">
          {__('MX promise:')}
        </Text>
        <Box alignItems="baseline" display="flex">
          <Text component="p" truncate={false} variant="Paragraph">
            {'🔒 '}
          </Text>
          <Text component="p" truncate={false} variant="Paragraph">
            <Box component="b" fontWeight={600}>
              {__('Secure: ')}
            </Box>
            {__('Industry-standard encryption protects your data.')}
          </Text>
        </Box>
        <Box alignItems="baseline" display="flex">
          <Text component="p" truncate={false} variant="Paragraph">
            {'⚙️ '}
          </Text>
          <Text component="p" truncate={false} variant="Paragraph">
            <Box component="b" fontWeight={600}>
              {__('Control: ')}
            </Box>
            {__('You can manage and revoke access anytime.')}
          </Text>
        </Box>
        <Box alignItems="baseline" display="flex">
          <Text component="p" truncate={false} variant="Paragraph">
            {'🛡️ '}
          </Text>
          <Text component="p" truncate={false} variant="Paragraph">
            <Box component="b" fontWeight={600}>
              {__('Private: ')}
            </Box>
            {__('Your data is never sold or shared without consent.')}
          </Text>
        </Box>
      </DialogContent>
      <DialogFooter
        onPrimaryAction={() => {
          setDialogIsOpen((prev) => !prev)
        }}
        onSecondaryAction={() => goToUrlLink('https://www.mx.com/company/')}
        primaryText={__('Close')}
        secondaryText={__('Learn more')}
      />
    </Dialog>
  )
}

const getStyles = () => {
  return {
    dialog: {
      '.MuiPaper-root': { maxWidth: '336px', minWidth: '336px' },
    },
  }
}
