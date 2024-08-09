# Connect Widget

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
  return <ConnectWidget />
}
```

## Props

|     `prop`      | `type` | `description` | `default` |
| :-------------: | :----: | :-----------: | :-------: |
| _\*Coming soon_ |        |               |           |

## Developing

1. Clone project
2. Install `Node(with npm)`. See [package.json](/package.json) for current required versions.
3. Run `npm i`
4. [Link Project](#linking-for-development)
5. Make changes
6. Open Pull Request

## Linking for Development

For developing this package locally, we suggest you use npm link to connect your local version of the package to your client app using the package.

1. In the npm package root, run `npm link`.
2. Then in your client project, run `npm link connect-widget`.

This will link the local package to your client project in the node modules. Unlink the package when you are finished or if you run into issues.

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to add/update tests as appropriate.