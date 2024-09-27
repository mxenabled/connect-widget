# Post Messages

The connect widget uses post messages to communicate with the parent window.

## `onPostMessage`

The `onPostMessage` function is used to send messages to the parent window.

```jsx
const onPostMessage = (event: string, data?: object) => {
  console.log('onPostMessage', event, data)
}
```

[<-- Back to README](../README.md#props)
