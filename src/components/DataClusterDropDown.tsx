import React from 'react'

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  Icon,
  Stack,
} from '@mui/material'
import { Text } from '@mxenabled/mxui'

import { __ } from 'src/utilities/Intl'

import cssStyles from './DataClusterDropDown.module.css'

interface DataClusterDropDownProps {
  dataCluster: { name: string; details: string[]; dataTest: string; icon: string }
}

export const DataClusterDropDown: React.FC<DataClusterDropDownProps> = ({ dataCluster }) => {
  const styles = getStyles()

  return (
    <Accordion>
      <AccordionSummary aria-controls="panel-content">
        <Stack alignItems="center" direction="row" display="flex">
          <Text
            bold={true}
            component="p"
            data-test={dataCluster.dataTest}
            truncate={false}
            variant="subtitle1"
          >
            <Icon sx={styles.icon}>{dataCluster.icon}</Icon>
            {dataCluster.name}
          </Text>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Text
          className={cssStyles.accordionDetailText}
          component="p"
          truncate={false}
          variant="subtitle2"
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
  )
}

const getStyles = () => {
  return {
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
