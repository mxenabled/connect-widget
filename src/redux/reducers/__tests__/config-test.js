import reducer, {
  initialState,
  selectInitialValues,
  selectUIMessageVersion,
} from 'src/redux/reducers/configSlice'
import { loadConnect } from 'src/redux/actions/Connect'
import { AGG_MODE, VERIFY_MODE } from 'src/const/Connect'
import { COMBO_JOB_DATA_TYPES } from 'src/const/comboJobDataTypes'

describe('configSlice', () => {
  it('should set verification mode when it is set', () => {
    const actionClientConfig = {
      mode: VERIFY_MODE,
    }

    const afterState = reducer(initialState, loadConnect(actionClientConfig))

    expect(afterState.mode).toBe(VERIFY_MODE)
  })

  it('should set verification mode via the products', () => {
    const actionClientConfig = {
      data_request: {
        products: [COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER],
      },
      mode: AGG_MODE,
    }

    const afterState = reducer(initialState, loadConnect(actionClientConfig))

    expect(afterState.mode).toBe(VERIFY_MODE)
  })

  it('should set verification mode via the products, when multiple products are passed', () => {
    const actionClientConfig = {
      data_request: {
        products: [COMBO_JOB_DATA_TYPES.ACCOUNT_NUMBER, COMBO_JOB_DATA_TYPES.TRANSACTIONS],
      },

      mode: AGG_MODE,
    }

    const afterState = reducer(initialState, loadConnect(actionClientConfig))

    expect(afterState.mode).toBe(VERIFY_MODE)
  })

  it('should set aggregation mode by default', () => {
    const afterState = reducer(initialState, loadConnect({}))

    expect(afterState.mode).toBe(AGG_MODE)
  })

  it('test sending a config that is not nested... bad test?', () => {
    const actionClientConfig = {
      ui_message_version: 4,
    }

    const afterState = reducer(initialState, loadConnect(actionClientConfig))

    expect(afterState.mode).toBe(AGG_MODE)
  })

  it('has verify mode, but a bad config is sent', () => {
    const actionClientConfig = {
      ui_message_version: 4,
    }

    const afterState = reducer(
      { ...initialState, mode: VERIFY_MODE },
      loadConnect(actionClientConfig),
    )

    expect(afterState.mode).toBe(VERIFY_MODE)
  })

  it('has verify mode, but a bad config is sent', () => {
    const actionClientConfig = {
      ui_message_version: 4,
      mode: AGG_MODE,
    }

    const afterState = reducer(
      { ...initialState, mode: VERIFY_MODE },
      loadConnect(actionClientConfig),
    )

    expect(afterState.mode).toBe(AGG_MODE)
  })
  it('has verify mode, but a bad config is sent', () => {
    const actionClientConfig = {
      ui_message_version: 4,
      connect: {},
    }

    const afterState = reducer(
      { ...initialState, mode: VERIFY_MODE },
      loadConnect(actionClientConfig),
    )

    expect(afterState.mode).toBe(VERIFY_MODE)
  })

  it('has verify mode, but a bad config is sent', () => {
    const actionClientConfig = {
      ui_message_version: 4,
      mode: AGG_MODE,
    }

    const afterState = reducer(
      { ...initialState, mode: VERIFY_MODE },
      loadConnect(actionClientConfig),
    )

    expect(afterState.mode).toBe(AGG_MODE)
  })

  it('should set ui_message_version to 4 if it is passed to loadConnect', () => {
    const actionClientConfig = {
      ui_message_version: 4,
    }

    const afterState = reducer(initialState, loadConnect(actionClientConfig))
    const uiMessageVersion = selectUIMessageVersion({ config: afterState })

    expect(uiMessageVersion).toBe(4)
  })

  it('should set the ui_message_version to an integer', () => {
    const actionClientConfig = {
      ui_message_version: '4',
    }

    const afterState = reducer(initialState, loadConnect(actionClientConfig))
    const uiMessageVersion = selectUIMessageVersion({ config: afterState })

    expect(uiMessageVersion).toBe(4)
  })

  it('should use existing ui_message_version if not passed to loadConnect', () => {
    const initialStateWithUiMessageVersion = {
      ...initialState,
      ui_message_version: 2,
    }
    const actionClientConfig = {}

    const afterState = reducer(initialStateWithUiMessageVersion, loadConnect(actionClientConfig))
    const uiMessageVersion = selectUIMessageVersion({ config: afterState })

    expect(uiMessageVersion).toBe(initialStateWithUiMessageVersion.ui_message_version)
  })

  it('should save the _initialValues used to load the widget and be able to retrieve them', () => {
    const afterState = reducer(
      initialState,
      loadConnect({
        ui_message_version: 4,
        mode: VERIFY_MODE,
      }),
    )

    const initialValues = selectInitialValues({ config: afterState })

    // Remove _initialValues from the current state to compare the rest of the state
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _initialValues, ...stateWithoutInitialValuesKey } = afterState
    expect(initialValues).toEqual(stateWithoutInitialValuesKey)
  })
})
