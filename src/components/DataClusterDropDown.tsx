import React from 'react'
// import { useTokens } from '@kyper/tokenprovider'
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import { Text } from '@kyper/mui'

interface DataClusterDropDownProps {
  dataCluster: { name: string; details: [string]; dataTest: string }
}

export const DataClusterDropDown: React.FC<DataClusterDropDownProps> = ({ dataCluster }) => {
  //   const tokens = useTokens()
  //   const styles = getStyles(tokens)

  return (
    <div>
      <Accordion>
        <AccordionSummary aria-controls="panel-content" expandIcon={<ExpandMore />}>
          <Text> {dataCluster.name}</Text>
        </AccordionSummary>
        <AccordionDetails>
          <Text>{''}</Text>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

// const getStyles = (tokens: any) => {
//   return { tokens }
// }
