// src/heroes/actions/team.actions.ts

// Importa la instancia de Axios ya configurada
import { heroApi } from "../api/hero.api";

// Obtiene la URL base (aunque en este caso no se usa, porque los equipos son solo strings)
//const BASE_URL = import.meta.env.VITE_API_URL; // opcional aquí

// Función asíncrona para obtener la lista de equipos
export const getTeamsAction = async (): Promise<string[]> => {
  // Llama al endpoint que creaste: GET /heroes/teams
  const { data } = await heroApi.get<string[]>("/teams");

  // Retorna directamente el array de strings
  return data;
};
