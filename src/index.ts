import type { Plugin, ResolvedConfig } from "vite";

export type CSPDirectiveValue = string | string[];

export interface CSPDirectives {
  "default-src"?: CSPDirectiveValue;
  "script-src"?: CSPDirectiveValue;
  "style-src"?: CSPDirectiveValue;
  "img-src"?: CSPDirectiveValue;
  "font-src"?: CSPDirectiveValue;
  "connect-src"?: CSPDirectiveValue;
  "media-src"?: CSPDirectiveValue;
  "object-src"?: CSPDirectiveValue;
  "frame-src"?: CSPDirectiveValue;
  "worker-src"?: CSPDirectiveValue;
  "manifest-src"?: CSPDirectiveValue;
  "form-action"?: CSPDirectiveValue;
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
  "default-src": "'self'",
  "script-src": ["'self'"],
  "style-src": ["'self'"],
  "img-src": ["'self'", "data:"],
  "font-src": "'self'",
  "connect-src": "'self'",
  "media-src": "'self'",
  "object-src": "'none'",
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

export default function cspPlugin(options: CSPPluginOptions = {}): Plugin {
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
