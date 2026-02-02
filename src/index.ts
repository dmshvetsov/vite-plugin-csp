import type { Plugin, ResolvedConfig } from "vite";

export type CSPDirectiveValue = string | string[];

/**
 * Map of CSP directive names to their allowed sources.
 *
 * Each directive value can be a space-separated string or an array of values,
 * which will be joined with spaces when the header is built.
 */
export interface CSPDirectives {
  /** Restricts the URLs which can be used in a document's `<base>` element (`base-uri`). */
  "base-uri"?: CSPDirectiveValue;
  /**
   * Defines the valid sources for web workers and nested browsing contexts
   * loaded using elements such as `<frame>` and `<iframe>` (`child-src`).
   * Fallback for `frame-src` and `worker-src`.
   */
  "child-src"?: CSPDirectiveValue;
  /** Restricts the URLs which can be loaded using script interfaces (`connect-src`). */
  "connect-src"?: CSPDirectiveValue;
  /** Serves as a fallback for the other fetch directives (`default-src`). */
  "default-src"?: CSPDirectiveValue;
  /** Specifies valid sources for fonts loaded using `@font-face` (`font-src`). */
  "font-src"?: CSPDirectiveValue;
  /** Restricts the URLs which can be used as the target of form submissions (`form-action`). */
  "form-action"?: CSPDirectiveValue;
  /** Specifies valid parents that may embed a page using `<frame>`, `<iframe>`, `<object>`, or `<embed>` (`frame-ancestors`). */
  "frame-ancestors"?: CSPDirectiveValue;
  /** Specifies valid sources for nested browsing contexts loaded into elements such as `<frame>` and `<iframe>` (`frame-src`). */
  "frame-src"?: CSPDirectiveValue;
  /** Specifies valid sources of images and favicons (`img-src`). */
  "img-src"?: CSPDirectiveValue;
  /** Specifies valid sources of application manifest files (`manifest-src`). */
  "manifest-src"?: CSPDirectiveValue;
  /** Specifies valid sources for loading media using the `<audio>`, `<video>` and `<track>` elements (`media-src`). */
  "media-src"?: CSPDirectiveValue;
  /** Specifies valid sources for the `<object>` and `<embed>` elements (`object-src`). */
  "object-src"?: CSPDirectiveValue;
  /**
   * Specifies valid sources for JavaScript and WebAssembly resources (`script-src`).
   * Fallback for `script-src-elem` and `script-src-attr`.
   */
  "script-src"?: CSPDirectiveValue;
  /**
   * Specifies valid sources for stylesheets (`style-src`).
   * Fallback for `style-src-elem` and `style-src-attr`.
   */
  "style-src"?: CSPDirectiveValue;
  /** Specifies valid sources for Worker, SharedWorker, or ServiceWorker scripts (`worker-src`). */
  "worker-src"?: CSPDirectiveValue;
}

export interface CSPPluginOptions {
  /**
   * CSP directives to apply. Can be an object or a function that receives the Vite config.
   */
  directives?: CSPDirectives | ((config: ResolvedConfig) => CSPDirectives);

  /**
   * Whether to include CSP
   * @default true
   */
  enabled?: boolean;

  /**
   * Additional CSP policy string to append
   */
  policy?: string;
}

const defaultDirectives: CSPDirectives = {
  "base-uri": "'self'",
  "default-src": "'self'",
  "script-src": ["'self'"],
  "style-src": ["'self'"],
  "img-src": ["'self'", "data:"],
  "font-src": "'self'",
  "connect-src": "'self'",
  "media-src": "'self'",
  "object-src": "'none'",
  "child-src": "'none'",
  "frame-src": "'none'",
  "worker-src": "'self'",
  "manifest-src": "'self'",
  "form-action": "'self'",
};

function buildCSPHeader(directives: CSPDirectives): string {
  const policies: string[] = [];

  for (const [directive, value] of Object.entries(directives)) {
    if (value === true) {
      policies.push(directive);
    } else if (value === false) {
      // Skip false values
    } else if (typeof value === "string") {
      policies.push(`${directive} ${value}`);
    } else if (Array.isArray(value)) {
      policies.push(`${directive} ${value.join(" ")}`);
    }
  }

  return policies.join("; ");
}

export function contentSecurityPolicy(options: CSPPluginOptions = {}): Plugin {
  const {
    directives = {},
    enabled: includeCsp = true,
    policy: additionalPolicy,
  } = options;

  let resolvedDirectives: CSPDirectives;

  return {
    name: "vite-csp-plugin",
    configResolved(resolvedConfig) {
      // Resolve directives (either function or object)
      const userDirectives =
        typeof directives === "function"
          ? directives(resolvedConfig)
          : directives;

      // Merge default directives with user directives
      resolvedDirectives = { ...defaultDirectives, ...userDirectives };
    },

    // configureServer(server) {
    //   if (includeDev) {
    //     const cspPolicy = buildCSPHeader(resolvedDirectives) +
    //       (additionalPolicy ? `; ${additionalPolicy}` : '')
    //     server.middlewares.use((_req, res, next) => {
    //       res.setHeader('Content-Security-Policy', cspPolicy)
    //       next()
    //     })
    //   }
    // },

    transformIndexHtml(html) {
      if (!includeCsp) {
        return html;
      }

      const cspPolicy =
        buildCSPHeader(resolvedDirectives) +
        (additionalPolicy ? `; ${additionalPolicy}` : "");

      const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="${cspPolicy}" />`;

      // Insert the CSP meta tag at the beginning of the head
      return html.replace(/<head>/, `<head>\n    ${cspMetaTag}`);
    },
  };
}
