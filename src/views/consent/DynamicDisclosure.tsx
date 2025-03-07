// import React, { useContext } from 'react'

// import { __ } from 'src/utilities/Intl'

// import { Button } from '@mui/material'
// import { Text } from '@kyper/mui'
// import { useTokens } from '@kyper/tokenprovider'

// import { SlideDown } from 'src/components/SlideDown'
// import { getDelay } from 'src/utilities/getDelay'

// import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
// import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

// import { PageviewInfo } from 'src/const/Analytics'
// import { POST_MESSAGES } from 'src/const/postMessages'

// import { PostMessageContext } from 'src/ConnectWidget'

// interface DynamicDisclosureProps {
//   onContinueClick: () => void
// }

// export const DynamicDisclosure: React.FC<DynamicDisclosureProps> = ({ onContinueClick }) => {
//   const [name, path] = PageviewInfo.CONNECT_DYNAMIC_DISCLOSURE
//   useAnalyticsPath(name, path)
//   const postMessageFunctions = useContext(PostMessageContext)

//   const tokens = useTokens()
//   const styles = getStyles(tokens)
//   const getNextDelay = getDelay()

//   return <div>placeholder</div>
// }

// const getStyles = (tokens: any) => {
//   return {}
// }
