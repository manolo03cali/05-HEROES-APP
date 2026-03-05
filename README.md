# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is currently not compatible with SWC. See [this issue](https://github.com/vitejs/vite-plugin-react/issues/428) for tracking the progress.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

# Prueba su funcionamiento en el siguiente link:

https://coruscating-froyo-123296.netlify.app/

# Pasos en la creación del proyecto:

1 npm create vite@latest para asegurarnos de usar la ultima versión.
seleccionamos React
luego Type script + sw

1 instalamos dependencias
En caso de que salga el menaje Use rolldown-vite (Experimental)?: por ahora le decimos que no es una caracteristica relativamente nueva.

# Generación se elementos visuales con shacn y tailwind usando los pasos de instalación https://ui.shadcn.com/docs/installation/vite

Instalamos nuestro primer componente de acuerdo a la documentación y adicionalmente agregamos en la definición del componente Button en Button variants el cursor-pointer porque esta caracteristica no viene por defecto,

# Para rutas manejamos react-router v7 Data

npm i react-router

#

Quitamos el import Image from 'next/Image' y
reemplazamos el Image de next por el tradicional img y quitamos el fill ya que no estamos usando next

# heroes App

##Levantar en desarrollo

1. Clonar el repositorio
2. Editat el archivo '.env' basado en el template
3. Ejecutar npm install
4. Ejecutar npm run dev
5. Levantar el backend

y paa el backend npm run start:dev

tanstack query

npm i @tanstack/react-query
vale la pena instalar esLint
npm i -D @tanstack/eslint-plugin-query
tambien se debe instalar las devtools
npm i @tanstack/react-query-devtools

# Instalaciones adicionales para el manejo del formulario

npx shadcn@latest add form
#formulario pendiente por construir

# Testing

Usamos vitest
npm install --save-dev @testing-library/react @testing-library/dom vitest jsdom
usamos Axios adapter
npm install axios-mock-adapter --save-dev
