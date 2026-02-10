# Mankai Plugins

This repository contains JavaScript plugins for [mankai](https://github.com/nohackjustnoobb/mankai).

You can find the compiled plugins in the [static branch](https://github.com/nohackjustnoobb/mankai-plugins/tree/static).

## Runtime Environment

The Mankai runtime overrides some built-in methods to integrate better with the app. Notably:

- `console.log`
- `fetch`

These methods may behave differently than in a standard browser or Node.js environment. If you believe the behavior should be consistent with standard JavaScript, please open an issue or submit a pull request.

### Injected Methods

The runtime also injects several utility methods into the global scope. See `src/utils/bridge.ts` for type definitions.

## Development

This project uses [Deno](https://deno.land/).

### Creating a New Plugin

To develop a new plugin, copy the `src/example` directory to a new directory under `src/` (e.g., `src/my-plugin`), and replace the implementation with your own.

#### meta.json

Each plugin must include a `meta.json` file. Only the `id` field is required, all other fields are optional.

##### getImageHeaders

The `getImageHeaders` field controls how images are fetched:

- If `null` or `undefined`: The plugin's `getImage` method will be called to fetch the image.
- If defined (including `{}`): The app will fetch the image directly using the provided headers, and `getImage` will not be called.

### Build

To build the plugins:

```bash
deno task build
```

This will generate the output in the `dist/` directory.

### Dev

To run in development mode:

```bash
deno task dev
```

## Disclaimer

The developers of this project do not assume any responsibility for how these plugins are used. This code is provided for educational and research purposes only. Users are solely responsible for their actions and must ensure they comply with all applicable laws and regulations.
