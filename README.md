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
    cspPlugin({
      directives: {
        'default-src': "'self'",
        // accept single string policy
        'script-src': "'self' 'unsafe-inline'",
        'style-src': "'self' 'unsafe-inline'",
        // or array of string that will be concatenated
        'img-src': ["'self'", "data: https:"],
        'connect-src': ["'self'", "https://api.example.com"]
      }
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
  'script-src': ["'self'"],
  'style-src': ["'self'"],
  'img-src': ["'self'", "data:"],
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

### `enabled`

Whether to enable CSP injection. Defaults to `true`.

When disabled, the plugin will not inject CSP meta tag.

### `policy`

An additional CSP policy string to append to the generated policy. Useful for complex policies that don't fit the directive object structure.

## How it works

The plugin injects a `<meta http-equiv="Content-Security-Policy">` tag into the HTML head at build time.

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
