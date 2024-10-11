import { createSelector } from '@reduxjs/toolkit'

export const getExperiments = (state) => state.experiments.items

/*
  This generates an object that references the name of each experiment to the experiments selected variant.
  { 
    "Experiment Name" : "Feature Name",
    ...
  }
*/
export const getExperimentNamesToUserVariantMap = createSelector(getExperiments, (experiments) => {
  return experiments.reduce((acc, experiment) => {
    if (experiment.is_active && experiment.selected_variant) {
      const selectedVariantFeatureGuid = experiment.selected_variant.user_feature.feature_guid
      // get the variant name
      const feature = experiment.features.find(
        (feature) => feature.guid === selectedVariantFeatureGuid,
      )

      return { ...acc, [experiment.name]: feature.name }
    }
    return acc
  }, {})
})
