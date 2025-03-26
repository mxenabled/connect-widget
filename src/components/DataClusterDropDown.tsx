import React from 'react'

import { useTokens } from '@kyper/mui'
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Icon,
  Stack,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { Text } from '@kyper/mui'

import { __ } from 'src/utilities/Intl'

interface DataClusterDropDownProps {
  dataCluster: { name: string; details: string[]; dataTest: string; icon: string }
}

export const DataClusterDropDown: React.FC<DataClusterDropDownProps> = ({ dataCluster }) => {
  const tokens = useTokens()
  const styles = getStyles(tokens)

  return (
    <div>
      <Accordion sx={styles.accordion}>
        <AccordionSummary
          aria-controls="panel-content"
          expandIcon={<ExpandMore sx={styles.expandIcon} />}
          sx={styles.accordionSummary}
        >
          <Stack alignItems="center" direction="row" display="flex">
            <Text
              component="p"
              data-test={dataCluster.dataTest}
              style={styles.summary}
              truncate={false}
              variant="Paragraph"
            >
              <Icon sx={styles.icon}>{dataCluster.icon}</Icon>
              {dataCluster.name}
            </Text>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ marginBottom: '16px' }}>
          <Text
            component="p"
            style={styles.accordionDetailText}
            truncate={false}
            variant="ParagraphSmall"
          >
            {__('This includes:')}
          </Text>
          <List sx={styles.list}>
            {Object.values(
              dataCluster.details.map((detail, i) => (
                <ListItem key={i} style={styles.listItem}>
                  {detail}
                </ListItem>
              )),
            )}
          </List>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getStyles = (tokens: any) => {
  return {
    accordion: {
      marginBottom: tokens.Spacing.Medium,
      borderRadius: '8px',
      '.Mui-expanded': {
        margin: tokens.Spacing.Medium,
        marginBottom: '0px',
      },
      '&.Mui-expanded:last-of-type': {
        borderRadius: '8px',
        marginBottom: tokens.Spacing.Medium,
      },
    },
    summary: {
      fontWeight: tokens.FontWeight.Semibold,
    },
    expandIcon: {
      marginRight: '16px',
      marginLeft: '-16px',
      color: '#323B46',
    },
    accordionSummary: { '.MuiAccordionSummary-content': { margin: '16px' } },
    accordionDetailText: {
      marginLeft: tokens.Spacing.XXLarge,
      marginTop: '-4px',
    },
    listItem: {
      display: 'list-item',
      fontSize: '13px',
      minHeight: '20px',
    },
    icon: {
      fontSize: 24,
      marginRight: '16px',
      verticalAlign: 'middle',
    },
    list: {
      listStyleType: 'disc',
      listStylePosition: 'inside',
      marginLeft: '40px',
      marginTop: '4px',
    },
  }
}
