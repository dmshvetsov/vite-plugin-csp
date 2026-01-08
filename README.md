# Vite CSP Plugin

A Vite plugin for managing Content Security Policy (CSP) headers and meta tags in your application.

## Installation

This package is part of the monorepo and should be installed via the workspace configuration.

## Usage

Import and configure the plugin in your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import { cspPlugin } from '@gacha/vite-csp-plugin'

export default defineConfig({
  plugins: [
    // ... other plugins
    cspPlugin({
      directives: {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
        'img-src': "'self' data: https:",
        'connect-src': "'self' https://api.example.com"
      },
      includeDev: true // Include CSP headers in development
    })
  ]
})
```

## Options

### `directives`

An object containing CSP directives, or a function that returns such an object with access to the resolved Vite config. Each directive value can be a string or an array of strings. The plugin comes with sensible defaults:

```typescript
const defaultDirectives = {
  'default-src': "'self'",
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", "data:", "https:"],
  'font-src': "'self'",
  'connect-src': "'self'",
  'media-src': "'self'",
  'object-src': "'none'",
  'frame-src': "'none'",
  'worker-src': "'self'",
  'manifest-src': "'self'",
  'form-action': "'self'"
}
```

You can override any of these defaults by providing your own values. When using arrays, they will be joined with spaces.

### `includeDev`

Whether to include CSP headers in development mode. Defaults to `false`.

When enabled, the plugin will add CSP headers to the development server responses.

### `policy`

An additional CSP policy string to append to the generated policy. Useful for complex policies that don't fit the directive object structure.

## How it works

The plugin:

1. **Build time**: Injects a `<meta http-equiv="Content-Security-Policy">` tag into the HTML head
2. **Development**: Optionally serves CSP headers via middleware when `includeDev` is enabled

## Common CSP Directives

- `'default-src'`: Fallback for other directives
- `'script-src'`: Controls script execution
- `'style-src'`: Controls stylesheet loading
- `'img-src'`: Controls image loading
- `'connect-src'`: Controls AJAX, WebSocket, etc.
- `'font-src'`: Controls font loading
- `'media-src'`: Controls media loading
- `'object-src'`: Controls plugins and embeds
- `'frame-src'`: Controls frame embedding

## Examples

### Basic configuration

```typescript
cspPlugin({
  directives: {
    'default-src': "'self'",
    'script-src': "'self'",
    'style-src': "'self'",
    'img-src': "'self' data: https:",
    'connect-src': "'self' https://api.example.com"
  }
})
```

### Strict CSP for production

```typescript
cspPlugin({
  directives: {
    'default-src': "'self'",
    'script-src': "'self'",
    'style-src': "'self'",
    'img-src': "'self'",
    'connect-src': "'self'",
    'object-src': "'none'",
    'base-uri': "'self'",
    'form-action': "'self'"
  },
  includeDev: false
})
```

### With additional policy

```typescript
cspPlugin({
  directives: {
    'default-src': "'self'",
    'script-src': "'self'"
  },
  policy: "frame-ancestors 'none'; upgrade-insecure-requests"
})
```

### Using arrays for directive values

```typescript
cspPlugin({
  directives: {
    'default-src': "'self'",
    'script-src': ['self', 'unsafe-inline'],
    'style-src': ['self', 'unsafe-inline'],
    'img-src': ['self', 'data:', 'https:'],
    'connect-src': ['self', 'https://api.example.com', 'https://cdn.example.com']
  }
})
```

### Using a function for dynamic configuration with access to Vite config

```typescript
cspPlugin({
  directives: (config) => {
    // Access to resolved Vite config and environment variables
    const isProduction = config.mode === 'production'
    const apiUrl = config.env.VITE_API_URL || 'https://api.example.com'

    return {
      'default-src': "'self'",
      'script-src': isProduction ? "'self'" : ["'self'", "'unsafe-inline'"],
      'connect-src': ['self', apiUrl],
      'img-src': ['self', 'data:', 'https:', 'blob:']
    }
  }
})
```
