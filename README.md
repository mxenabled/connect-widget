# Connect Widget

![NPM Version](https://img.shields.io/npm/v/%40mxenabled%2Fconnect-widget)

This is the **UI only** for the connect widget. Heavy configuration and an API are needed for this project to work. See [usage](#usage) and [props](#props) for more details.

## Installation

Install using npm package manager:

```bash
npm install @mxenabled/connect-widget
```

## Usage

1. Install package: `npm install --save @mxenabled/connect-widget`
2. Import `ApiProvider` and `ConnectWidget`. Add both to your project.
3. Pass applicable props to widget and your API to the provider.

```jsx
import ConnectWidget, { ApiProvider } from '@mxenabled/connect-widget'
import apiService from './apiService' // You custom api service

const App = () => {
  return (
    <ApiProvider apiValue={apiService}>
      <ConnectWidget {...props} />
      {/* See props details below */}
    </ApiProvider>
  )
}
```

## Props

| **Prop**                       | **Type**                                                   | **Description**                                                                                                                                                                  | **Default**                                   |
| :----------------------------- | :--------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------- |
| `clientConfig`                 | [`ClientConfigType`](./typings/connectProps.d.ts)          | The connect widget uses the config to set the initial state and behavior of the widget. [More details](./docs/CLIENT_CONFIG.md)                                                  | See more details                              |
| `language`                     | [`LanguageType`](./typings/connectProps.d.ts)              | The connect widget supports multiple languages and custom copy. Supported locale options: `en`, `es`, and `fr-ca`.                                                               | `{ locale: 'en', custom_copy_namespace: '' }` |
| `onAnalyticEvent`              | [`AnalyticContextType`](./typings/connectProps.d.ts)       | The connect widget provides a way to track events and pageviews using your own analytics provider. [More details](./docs/ANALYTICS.md#onanalyticevent)                           | `null`                                        |
| `onAnalyticPageview`           | [`AnalyticContextType`](./typings/connectProps.d.ts)       | The connect widget provides a way to track events and pageviews using your own analytics provider. [More details](./docs/ANALYTICS.md#onanalyticpageview)                        | `null`                                        |
| `onPostMessage`                | [`PostMessageContextType`](./typings/connectProps.d.ts)    | The connect widget uses post messages to communicate with the parent window. [More details](./docs/POST_MESSAGES.md)                                                             | `null`                                        |
| `postMessageEventOverrides`    | [`PostMessageEventOverrides`](./typings/connectProps.d.ts) | These can be used to override the post message events for specific post messages                                                                                                 | `null`                                        |
| `onShowConnectSuccessSurvey`   | [`AnalyticContextType`](./typings/connectProps.d.ts#L100)  | The connect widget provides a way to let your analytics provider know that the connect success survey was shown. [More details](./docs/ANALYTICS.md#onShowConnectSuccessSurvey)  |
| `onSubmitConnectSuccessSurvey` | [`AnalyticContextType`](./typings/connectProps.d.ts#L101)  | The connect widget provides a way to submit connect success survey responses using your own analytics provider. [More details](./docs/ANALYTICS.md#onSubmitConnectSuccessSurvey) |                                               |
| `profiles`                     | [`ProfilesTypes`](./typings/connectProps.d.ts)             | The connect widget uses the profiles to set the initial state of the widget. [More details](./docs/PROFILES.md)                                                                  | See more details                              |
| `userFeatures`                 | [`UserFeaturesType`](./typings/connectProps.d.ts)          | The connect widget uses user features to determine the behavior of the widget. [More details](./docs/USER_FEATURES.md)                                                           | See more details                              |
| `showTooSmallDialog`           | `boolean`                                                  | The connect widget can show a warning when the widget size is below the supported 320px.                                                                                         | `true`                                        |

## ApiProvider

You need to pass an object containing API endpoint callbacks as the `apiValue` prop of the ApiProvider as described in the [usage](#usage) section for the widget to work. [Here](./docs/APIDOCUMENTATION.md) is a more detailed list of the API endpoint callbacks.

## Development Set Up

1. Clone project
2. Install `Node(with npm)`. See [package.json](/package.json) for current required versions
3. Run `npm i`
4. Make your code changes - [Follow Conventional Commits](#commit-message-requirements)
5. Run `npm run build` to build the project
6. [Link Project](#linking-for-development)
7. Test your changes
8. Update translations and documentation as needed
9. Open Pull Request

## Commit Message Requirements

_To make commits that trigger a package release, use `npx cz`, it will launch easy to follow commitizen prompts._

A new _MAJOR.MINOR.PATCH_ release will be generated if at least one of the following types are used, see [Conventional Commits Documentation](https://www.conventionalcommits.org/) for more specifics.

- `fix:` -> PATCH bump
- `feat:` -> MINOR bump

Major bump (any type with a footer of `BREAKING CHANGE:`)

```
<any_type>: <message>

BREAKING CHANGE: <description>
```

## Linking for Development

For developing this package locally, we suggest you use npm link to connect your local version of the package to your client app using the package.

1. In the npm package root, run `npm link`.
2. Then in your consumer project, run `npm link @mxenabled/connect-widget`.

This will link the local package to your project in the node modules. Unlink the package when you are finished or if you run into issues.

## Contributing

Pull requests are welcome. Please open an issue first to discuss what you would like to change.

Make sure to add/update tests, translations, and documentation as appropriate.

### Architecture Decision Records

We have some [architecture decision records](./architectureDecisionRecords/) that outline what is expected when contributing.

## Changes

View our notes for each release [here](https://github.com/mxenabled/connect-widget/releases)
