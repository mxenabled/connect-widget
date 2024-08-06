import React, { ReactNode } from 'react'
import useExperiment from 'src/connect/hooks/useExperiment'
import { createSimpleStore } from 'src/connect/utilities/reduxHelpers'
import { getActiveABExperimentDetails } from 'src/connect/hooks/useExperiment'
import { Provider } from 'react-redux'

// Importing directly from testing-library because we don't need the customizations
import { renderHook } from '@testing-library/react'

// This is a loose "mock" of connectABExperiments in src/connect/experiments.js
// TODO: The API/structure of experiment data should be improved
const connectABExperiments = {
  EXP_1: {
    A: '/a',
    B: '/b',
  },
  EXP_2: {
    C: '/c',
    D: '/d',
  },
}

// Testing experiments involves having a particular state, lets set up state to test with
const experimentName = 'TEST_EXPERIMENT'
const variantA = 'TEST_EXPERIMENT_A'
const variantB = 'TEST_EXPERIMENT_B'

const experimentPaths = {
  [variantA]: '/a',
  [variantB]: '/b',
}

/**
 *
 * @param {string} assignedFeatureGuid - use FTR-A or FTR-B
 * or, any listed guid from the "features" list
 * @returns
 */
const createMockedExperimentState = (assignedFeatureGuid: string) => ({
  experiments: {
    items: [
      {
        guid: 'EXP-TEST_A_B',
        name: experimentName,
        external_guid: experimentName,
        is_active: true,
        selected_variant: {
          user_feature: {
            guid: 'URF-1',
            feature_guid: assignedFeatureGuid,
            user_guid: 'USR-1',
            is_enabled: true,
            client_guid: 'CLT-1',
          },
        },
        features: [
          {
            guid: 'FTR-A',
            name: variantA,
            external_guid: variantA,
            experiment_guid: 'EXP-TEST_A_B',
          },
          {
            guid: 'FTR-B',
            name: variantB,
            external_guid: variantB,
            experiment_guid: 'EXP-TEST_A_B',
          },
        ],
      },
    ],
    loading: false,
  },
})

// Start the test suites
describe('useExperiment tests', () => {
  it('Feature A has been assigned', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )
    const state = createMockedExperimentState('FTR-A')
    const store = createSimpleStore(state)

    const { result } = renderHook(() => useExperiment(experimentName, experimentPaths), { wrapper })
    expect(result.current).toStrictEqual({ experimentVariant: variantA, variantPath: '/a' })
  })

  it('Feature B has been assigned', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    )

    const state = createMockedExperimentState('FTR-B')
    const store = createSimpleStore(state)

    const { result } = renderHook(() => useExperiment(experimentName, experimentPaths), { wrapper })
    expect(result.current).toStrictEqual({ experimentVariant: variantB, variantPath: '/b' })
  })
})

// Unique A/B test suites
describe('getActiveABExperimentDetails tests', () => {
  it('1 Connect AB experiment is active and it is the only active Connect AB experiment', () => {
    const userExperimentAssignments = {
      EXP_1: 'A',
    }
    const experimentDetails = getActiveABExperimentDetails(
      userExperimentAssignments,
      connectABExperiments,
    )

    expect(experimentDetails.experimentVariant).toBe('A')
    expect(experimentDetails.variantPath).toBe(connectABExperiments.EXP_1.A)
  })

  it('2 Connect AB experiments are active, no details should be returned', () => {
    const userExperimentAssignments = {
      EXP_1: 'A',
      EXP_2: 'C',
    }
    const experimentDetails = getActiveABExperimentDetails(
      userExperimentAssignments,
      connectABExperiments,
    )

    expect(experimentDetails.experimentVariant).toBe('')
    expect(experimentDetails.variantPath).toBe('')
  })

  it('No Connect AB experiment is active, but another experiment is', () => {
    const userExperimentAssignments = {
      FIREFLY_EXPERIMENT: 'SUPER_SECRET_EXPERIMENT',
    }
    const experimentDetails = getActiveABExperimentDetails(
      userExperimentAssignments,
      connectABExperiments,
    )

    expect(experimentDetails.experimentVariant).toBe('')
    expect(experimentDetails.variantPath).toBe('')
  })

  it('No Connect AB experiment is active, but a few others are', () => {
    const userExperimentAssignments = {
      FIREFLY_EXPERIMENT: 'SUPER_SECRET_EXPERIMENT',
      OTHER_EXPERIMENT: 'OTHER',
    }
    const experimentDetails = getActiveABExperimentDetails(
      userExperimentAssignments,
      connectABExperiments,
    )

    expect(experimentDetails.experimentVariant).toBe('')
    expect(experimentDetails.variantPath).toBe('')
  })

  it('1 Connect AB experiment is active and a non-connect experiment is active', () => {
    const userExperimentAssignments = {
      EXP_1: 'A',
      FIREFLY_EXPERIMENT: 'SUPER_SECRET_EXPERIMENT',
    }
    const experimentDetails = getActiveABExperimentDetails(
      userExperimentAssignments,
      connectABExperiments,
    )

    expect(experimentDetails.experimentVariant).toBe('A')
    expect(experimentDetails.variantPath).toBe(connectABExperiments.EXP_1.A)
  })
})
