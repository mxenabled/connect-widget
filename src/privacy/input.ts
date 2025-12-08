/* eslint-disable no-restricted-imports */
// This is the ONLY file that @kyper related inputs should be directly imported

import { Radio, PASSWORD_VALIDATIONS } from '@kyper/input'
import { Select } from '@kyper/select'
import { SelectionBox } from '@mxenabled/mxui'
import { UserFeedback } from '@kyper/userfeedback'
import { withProtection } from 'src/privacy/withProtection'
import { TextField } from '@mxenabled/mxui'

/*
  Add security to Kyper Inputs by wrapping them in a Higher Order Component that
  handles security, and then re-export the same-named component for consumers
  
  Example code snippets:

  const Protected<inputname> = withProtection(<inputname>)
  ...
  export { Protected<inputname> as <inputname> }
*/

const ProtectedTextField = withProtection(TextField)
const ProtectedRadio = withProtection(Radio)
const ProtectedSelect = withProtection(Select)
const ProtectedSelectionBox = withProtection(SelectionBox)
const ProtectedUserFeedback = withProtection(UserFeedback)

export {
  ProtectedTextField as TextField,
  ProtectedRadio as Radio,
  ProtectedSelect as Select,
  ProtectedSelectionBox as SelectionBox,
  ProtectedUserFeedback as UserFeedback,
  PASSWORD_VALIDATIONS as PasswordValidations,
}
 