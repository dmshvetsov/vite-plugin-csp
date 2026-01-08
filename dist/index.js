"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultDirectives = {
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
function buildCSPHeader(directives) {
    const policies = [];
    for (const [directive, value] of Object.entries(directives)) {
        if (value === true) {
            policies.push(directive);
        }
        else if (value === false) {
            // Skip false values
        }
        else if (typeof value === "string") {
            policies.push(`${directive} ${value}`);
        }
        else if (Array.isArray(value)) {
            policies.push(`${directive} ${value.join(" ")}`);
        }
    }
    return policies.join("; ");
}
function cspPlugin(options = {}) {
    const { directives = {}, enabled: includeCsp = true, policy: additionalPolicy, } = options;
    let resolvedDirectives;
    return {
        name: "vite-csp-plugin",
        configResolved(resolvedConfig) {
            // Resolve directives (either function or object)
            const userDirectives = typeof directives === "function"
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
            const cspPolicy = buildCSPHeader(resolvedDirectives) +
                (additionalPolicy ? `; ${additionalPolicy}` : "");
            const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="${cspPolicy}" />`;
            // Insert the CSP meta tag at the beginning of the head
            return html.replace(/<head>/, `<head>\n    ${cspMetaTag}`);
        },
    };
}
exports.default = cspPlugin;
