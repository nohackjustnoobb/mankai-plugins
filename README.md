# Mankai Plugin

This repository contains JavaScript plugins for [Mankai](https://github.com/nohackjustnoobb/Mankai).

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
