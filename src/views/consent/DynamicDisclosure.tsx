// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { Fragment } from 'react'
// import { useSelector } from 'react-redux'
// import type { RootState } from 'reduxify/Store'

// import { __ } from 'src/utilities/Intl'

// import { IconButton, Stack } from '@mui/material'
// import { Text } from '@kyper/mui'
// import { useTokens } from '@kyper/tokenprovider'
// import { SlideDown } from 'src/components/SlideDown'
// import { getDelay } from 'src/utilities/getDelay'
// import { InfoOutlined } from '@mui/icons-material'

// import { PrivateAndSecure } from 'src/components/PrivateAndSecure'
// import useAnalyticsPath from 'src/hooks/useAnalyticsPath'

// import { PageviewInfo } from 'src/const/Analytics'
// import { ConnectLogoHeader } from 'src/components/ConnectLogoHeader'
// import { AGG_MODE, VERIFY_MODE } from 'src/const/Connect'
// import { getConsentDataClusters } from 'src/const/ConsentDataClusters'

// interface DynamicDisclosureProps {
//   onContinueClick: () => void
// }

// export const DynamicDisclosure = React.forwardRef<Element, DynamicDisclosureProps>(
//   ({ OnContinueClick }) => {
//     const [name, path] = PageviewInfo.CONNECT_DYNAMIC_DISCLOSURE
//     useAnalyticsPath(name, path)

//     const tokens = useTokens()
//     const institution = useSelector((state: RootState) => state.connect.selectedInstitution)
//     const appName = useSelector((state: RootState) => state.profiles.client.oauth_app_name || null)
//     const styles = getStyles(tokens)
//     const getNextDelay = getDelay()

//     const consentClusters = getConsentDataClusters()
//     const mode = useSelector((state: RootState) => state.config.mode || AGG_MODE)

//     const IS_IN_AGG_MODE = mode === AGG_MODE
//     const IS_IN_VERIFY_MODE = mode === VERIFY_MODE

//     let modeUseCase

//     if (IS_IN_AGG_MODE && IS_IN_VERIFY_MODE) {
//       modeUseCase = __('move money and manage your finances')
//     } else if (IS_IN_AGG_MODE) {
//       modeUseCase = __('manage your finances')
//     } else if (IS_IN_VERIFY_MODE) {
//       modeUseCase = __('move money')
//     }

//     return (
//       <div>
//         <Fragment>
//           <SlideDown delay={getNextDelay()}>
//             <div style={styles.logoHeader}>
//               <ConnectLogoHeader institutionGuid={institution.guid} />
//             </div>
//           </SlideDown>
//           <SlideDown delay={getNextDelay()}>
//             <Text
//               bold={true}
//               component="h2"
//               data-test="dynamic-disclosure-title"
//               style={styles.title}
//               truncate={false}
//               variant="H2"
//             >
//               {__('Share your data')}
//             </Text>
//           </SlideDown>
//           <SlideDown delay={getNextDelay()}>
//             <Stack alignItems="center" direction="row" spacing={1}>
//               <Text
//                 component="p"
//                 data-test="dynamic-disclosure-p1"
//                 style={styles.paragraph}
//                 truncate={false}
//                 variant="Paragraph"
//               >
//                 {appName
//                   ? __('%1 uses MX Technologies ', appName)
//                   : __('This app uses MX Technologies ')}
//                 <IconButton sx={{ fontSize: 16, padding: 0, minWidth: 0, minHeight: 0 }}>
//                   <InfoOutlined sx={{ fontSize: 16, color: '#161A20', marginBottom: '2px' }} />
//                 </IconButton>
//                 {institution.name
//                   ? __(' to securely access the following %1 data to', institution.name)
//                   : __('to securely access the following data to')}
//                 <span style={styles.useCase}>{__(' help you %1:', modeUseCase)}</span>
//               </Text>
//             </Stack>
//           </SlideDown>
//         </Fragment>
//       </div>
//     )
//   },
// )

// const getStyles = (tokens: any) => {
//   return {
//     logoHeader: {
//       marginTop: tokens.Spacing.XSmall,
//     },
//     title: {
//       marginTop: tokens.Spacing.Large,
//       marginBottom: tokens.Spacing.Large,
//       textAlign: 'center' as any,
//     },
//     paragraph: {
//       marginBottom: tokens.Spacing.Large,
//     },
//     useCase: {
//       fontWeight: tokens.FontWeight.Semibold,
//     },
//   }
// }

// DynamicDisclosure.displayName = 'DynamicDisclosure'
