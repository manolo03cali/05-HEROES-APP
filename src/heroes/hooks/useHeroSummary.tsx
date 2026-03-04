// Hook principal de React Query para manejar peticiones HTTP,
// cacheo, estados de carga, error, etc.
import { useQuery } from "@tanstack/react-query";

// Función que realiza la llamada al backend para obtener el resumen
// (por ejemplo: totales, estadísticas, conteos, etc.)
import { getSummaryActions } from "../actions/get-summary.actions";

// Hook personalizado para obtener el resumen de héroes
export const useHeroSummary = () => {
  // useQuery ejecuta la petición y maneja automáticamente:
  // loading, error, success, cache y re-fetch
  return useQuery({
    // Identificador único de esta consulta en la cache de React Query
    // Se usa para saber cuándo reutilizar o invalidar la información
    queryKey: ["summary-information"],

    // Función que se ejecuta para obtener los datos
    // Debe retornar una Promise
    queryFn: () => getSummaryActions(),

    // Tiempo (en milisegundos) durante el cual los datos
    // se consideran "frescos"
    // 5 minutos = 60 segundos * 1000 ms * 5
    staleTime: 60 * 1000 * 5,
  });
};
