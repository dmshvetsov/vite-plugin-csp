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
export declare function contentSecurityPolicy(options?: CSPPluginOptions): Plugin;
