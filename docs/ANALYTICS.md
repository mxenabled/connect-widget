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

| Event                     | Description | Data |
| ------------------------- | ----------- | ---- |
| _Events list coming soon_ |             |      |

## `onAnalyticPageview`

The `onAnalyticPageview` function is used to track pageviews.

```jsx
const onAnalyticPageview = (path: string, metadata: object) => {
  console.log('onAnalyticPageview', path, metadata)
}
```

### Analytic Pageviews

| Event                        | Description | Data |
| ---------------------------- | ----------- | ---- |
| _Pageviews list coming soon_ |             |      |

[<-- Back to README](../README.md#props)
