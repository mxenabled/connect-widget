# Analytics

The connect widget provides a way to track events and pageviews using your own analytics provider.

## `onAnalyticEvent`

The `onAnalyticEvent` function is used to track events.

```jsx
const onAnalyticEvent = (eventName: string, metadata: object) => {
  console.log('onAnalyticEvent', eventName, metadata)
}
```

## `onAnalyticPageview`

The `onAnalyticPageview` function is used to track pageviews.

```jsx
const onAnalyticPageview = (path: string, metadata: object) => {
  console.log('onAnalyticPageview', path, metadata)
}
```

[<-- Back to README](../README.md#props)
