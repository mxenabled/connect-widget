# Connect Widget

## This project is in Beta DO NOT USE!

![NPM Version](https://img.shields.io/npm/v/connect-widget?link=https%3A%2F%2Fwww.npmjs.com%2Fpackage%2Fconnect-widget)

This is the UI for the connect widget. See [usage](#usage) and [props](#props) for more details.

## Installation

Install using npm package manager:

```bash
npm install connect-widget
```

## Usage

```jsx
import ConnectWidget from 'connect-widget'

const App = () => {
  return (
    <ConnectWidget
      {...props} // See props below
    />
  )
}
```

## Props

|       **Prop**       |                          **Type**                           |                                                                      **Description**                                                                      |                 **Default**                 |
| :------------------: | :---------------------------------------------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------: |
|    `clientConfig`    |   [`configType`](./src/redux/reducers/configSlice.ts#L7)    |              The connect widget uses the config to set the initial state and behavior of the widget. [More details](./docs/CLIENT_CONFIG.md)              |                                             |
|      `language`      |     `{ locale: string, custom_copy_namespace: string }`     |                             The connect widget supports multiple languages. Current locale options: `en`, `es`, and `fr-ca`.                              | `{ locale: en, custom_copy_namespace: '' }` |
|  `onAnalyticEvent`   |       `(eventName: string, metadata: object) => void`       |          The connect widget provides a way to track events and pageviews using your own analytics provider. [More details](./docs/ANALYTICS.md)           |                 `() => {}`                  |
| `onAnalyticPageview` |         `(path: string, metadata: object) => void`          | The connect widget provides a way to track events and pageviews using your own analytics provider. [More details](./docs/ANALYTICS.md#onAnalyticPageview) |                 `() => {}`                  |
|   `onPostMessage`    |          `(event: string, data?: object) => void`           |                   The connect widget uses post messages to communicate with the parent window. [More details](./docs/POST_MESSAGES.md)                    |                 `() => {}`                  |
|      `profiles`      | [`ProfileState`](./src/redux/reducers/profilesSlice.tsx#L3) |                      The connect widget uses the profiles to set the initial state of the widget. [More details](./docs/PROFILES.md)                      |                    `{}`                     |
|    `userFeatures`    |                     `UserFeaturesType`                      |                  The connect widget uses user features to determine the behavior of the widget. [More details](./docs/USER_FEATURES.md)                   |                    `{}`                     |
| `showTooSmallDialog` |                          `boolean`                          |                                      The connect widget can show a warning when the widget size is below 320px min.                                       |                   `true`                    |

## Developing

1. Clone project
2. Install `Node(with npm)`. See [package.json](/package.json) for current required versions.
3. Run `npm i`
4. Run `npm run build` to build the project
5. [Link Project](#linking-for-development)
6. Make changes
7. Open Pull Request

## Linking for Development

For developing this package locally, we suggest you use npm link to connect your local version of the package to your client app using the package.

1. In the npm package root, run `npm link`.
2. Then in your client project, run `npm link connect-widget`.

This will link the local package to your client project in the node modules. Unlink the package when you are finished or if you run into issues.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to add/update tests as appropriate.
