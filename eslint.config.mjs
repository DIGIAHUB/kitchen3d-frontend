import nextVitals from "eslint-config-next/core-web-vitals";

export default [
  { ignores: [".next/**", ".next-preview/**", ".next-candidate/**", "node_modules/**"] },
  ...nextVitals,
];
