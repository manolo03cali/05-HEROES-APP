// Importo el hook useQuery de React Query para manejar
// la obtención de datos, caché, estados de loading y error
import { useQuery } from "@tanstack/react-query";

// Importo la acción que hace la llamada al backend
// Esta función es la que realmente trae los héroes paginados
import { getHeroesByPageAction } from "../actions/get-heroes-by-page.actions";

// Creo un hook personalizado para encapsular la lógica
// de obtener héroes con paginación y filtros
export const usePaginatedHero = (
  page: number, // número de página actual
  limit: number, // cantidad de registros por página
  category = "all", // filtro de categoría (por defecto "all")
  tab?: string, // tab seleccionada (opcional)
) => {
  // Retorno directamente el resultado de useQuery
  // Esto incluye: data, isLoading, isError, refetch, etc.
  return useQuery({
    // queryKey identifica de forma única la consulta en la caché
    // Si alguno de estos valores cambia, React Query vuelve a ejecutar la query
    queryKey: ["heroes", { page, limit, category, tab }],

    // queryFn es la función que obtiene los datos
    // Aquí llamo a la acción que consulta el backend
    // Uso +page y +limit para asegurar que sean números
    queryFn: () => getHeroesByPageAction(+page, +limit, category, tab),

    // Tiempo durante el cual la data se considera fresca
    // Evita refetch innecesarios y mejora performance
    staleTime: 60 * 1000 * 5, // 5 minutos
  });
};
