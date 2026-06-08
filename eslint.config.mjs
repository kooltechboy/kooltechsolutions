import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scratch/**",
    "tsconfig.tsbuildinfo",
  ]),
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      // Many client pages fetch data on mount and update loading state around
      // those requests. Keep the React Compiler signal visible without making
      // established data-loading flows fail lint.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
