// Primero importo axios, que es la librería que uso para hacer peticiones HTTP
// de manera sencilla y organizada.
import axios from "axios";

// Luego tomo la URL base de mi backend desde las variables de entorno de Vite.
// Esta URL cambia según si estoy en desarrollo o en producción,
// así que la obtengo dinámicamente.
const BASE_URL = import.meta.env.VITE_API_URL;

// Ahora creo una instancia personalizada de axios.
// Lo hago para no repetir la misma URL en cada petición
// y para poder agregar configuraciones globales más adelante si lo necesito.
export const heroApi = axios.create({
  // Aquí defino la URL base para todas las peticiones relacionadas con héroes.
  // Básicamente, cada vez que llame heroApi.get("/batman"),
  // axios va a construir la URL completa así:
  // `${BASE_URL}/api/heroes/batman`
  baseURL: `${BASE_URL}/api/heroes`,
});
