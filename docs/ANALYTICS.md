# [←](../README.md#props) Analytics

The connect widget provides a way to track events and pageviews using your own analytics provider.

## `onAnalyticEvent`

The `onAnalyticEvent` function is used to track events.

```jsx
const onAnalyticEvent = (eventName: string, metadata: object) => {
  console.log('onAnalyticEvent', eventName, metadata)
}
```

### Analytic Events

_Detailed events list coming soon. View [AnalyticEvents](../src/const/Analytics.js) for a list of events._

## `onAnalyticPageview`

The `onAnalyticPageview` function is used to track pageviews.

```jsx
const onAnalyticPageview = (path: string, metadata: object) => {
  console.log('onAnalyticPageview', path, metadata)
}
```

### Analytic Pageviews

_Detailed pageviews list coming soon. View [AnalyticPageviews](../src/const/Analytics.js) for a list of pageviews._

<br />

[<-- Back to README](../README.md#props)
