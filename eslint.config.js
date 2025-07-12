import js from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: { react: pluginReact },
    rules: {
      // tus reglas personalizadas
    },
    settings: {
      react: {
        version: "detect", // <--- Esto hace que detecte automáticamente la versión de React instalada
      },
    },
  },
];
