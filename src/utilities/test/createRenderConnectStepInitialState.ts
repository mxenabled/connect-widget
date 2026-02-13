import { initialState } from 'src/services/mockedData'

export const createRenderConnectStepInitialState = (
  step: string,
  selectedInstitution?: InstitutionResponseType,
) => ({
  ...initialState,
  connect: {
    ...initialState.connect,
    location: [{ step }],
    selectedInstitution,
  },
})
