// Importa la instancia de Axios configurada para consumir la API de héroes.
// Esta instancia normalmente tiene configurado el "baseURL", headers, etc.
import { heroApi } from "../api/hero.api";

// Importa el tipo "Hero" para tipar correctamente la respuesta esperada desde la API.
// Esto ayuda a TypeScript a detectar errores si el backend no envía lo esperado.
import type { Hero } from "../types/hero.interface";

// Obtiene la URL base del backend desde las variables de entorno de Vite.
// Ejemplo: http://localhost:3000
const BASE_URL = import.meta.env.VITE_API_URL;

// Función para obtener un héroe específico basado en un "slug" o identificador.
// Es asíncrona porque hace una petición a un servidor externo.
export const getHeroAction = async (idSlug: string) => {
  // Realiza una petición GET a la ruta "/{idSlug}".
  // Tipamos la respuesta como Hero para obtener autocompletado y seguridad de tipos.
  const { data } = await heroApi.get<Hero>(`/${idSlug}`);

  // Retornamos toda la información del héroe que llega desde el backend,
  // pero sobrescribimos la propiedad "image" para convertir el nombre del archivo
  // en una URL completa que apunte al servidor.
  // Ejemplo: "/batman.png" -> "http://localhost:3000/images/batman.png"
  return {
    ...data,
    image: `${BASE_URL}/images/${data.image}`,
  };
};
