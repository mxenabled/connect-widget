// This is the ONLY file that @kyper related inputs should be directly imported

import { SelectionBox } from '@mxenabled/mxui'
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
const ProtectedSelectionBox = withProtection(SelectionBox)
const PasswordValidations = {
  LEADING_SPACE: 'leading_space',
  TRAILING_SPACE: 'trailing_space',
  LEADING_AND_TRAILING_SPACE: 'leading_and_trailing_space',
}

export {
  ProtectedTextField as TextField,
  ProtectedSelectionBox as SelectionBox,
  PasswordValidations,
}
