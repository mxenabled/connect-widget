import { ActionTypes, loadExperiments } from 'src/redux/actions/Experiments'

describe('Experiments', () => {
  describe('loadExperiments', () => {
    it('should return and action with type, LOAD_EXPERIMENTS, and payload of experiments', () => {
      expect(loadExperiments([])).toEqual({ type: ActionTypes.LOAD_EXPERIMENTS, payload: [] })
    })
  })
})
