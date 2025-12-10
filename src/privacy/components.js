import {Text} from '@mxenabled/mxui'
import { withProtection } from 'src/privacy/withProtection'

// Add security to Kyper Components
export const ProtectedText = withProtection(Text)

export { ProtectedText as Text }
