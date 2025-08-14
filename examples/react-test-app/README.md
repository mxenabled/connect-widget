# React Test App for @mxenabled/connect-widget

This is a test application that uses the current build of the `@mxenabled/connect-widget` library.

## Development Workflow

### From the root directory (`github-connect-widget/`):

1. **Start development with automatic rebuilding:**

   ```bash
   npm run dev:with-example
   ```

   This will:

   - Start watching the library for changes and rebuild automatically
   - Start the React test app dev server
   - Any changes to the library will trigger a rebuild and the test app will pick up the changes

2. **Build and run example app:**

   ```bash
   npm run example:dev
   ```

   This will build the library once and then start the example app.

3. **Build example app for production:**
   ```bash
   npm run example:build
   ```

### From this directory (`examples/react-test-app/`):

1. **Start dev server (requires library to be built first):**

   ```bash
   npm run dev
   ```

2. **Reinstall the widget if you're having dependency issues:**

   ```bash
   npm run reinstall-widget
   ```

3. **Fresh start (reinstall dependencies and start dev server):**
   ```bash
   npm run dev:fresh
   ```

## How it works

- The test app depends on `@mxenabled/connect-widget` using `"file:../../dist"`
- This creates a symlink to the built library in the root `dist/` folder
- When you build the library, the changes are immediately available to the test app
- The `dev:with-example` script uses `concurrently` to run both the library build watcher and the test app dev server

## Troubleshooting

If you're having issues with the library not updating:

1. Make sure the library is built: `npm run build` from the root
2. Reinstall the widget dependency: `npm run reinstall-widget` from this directory
3. Try the fresh start: `npm run dev:fresh` from this directory

---

# Original Vite Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
