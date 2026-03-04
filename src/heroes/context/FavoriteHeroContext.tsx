// Importamos funciones y tipos necesarios desde React
import {
  createContext, // Para crear un Context
  useEffect, // Para ejecutar efectos secundarios (localStorage)
  useState, // Para manejar estado
  type PropsWithChildren, // Tipo para componentes que reciben children
} from "react";

// Importamos el tipo Hero (define la forma del objeto héroe)
import type { Hero } from "../types/hero.interface";

// Interfaz que define la "forma" del contexto
// Es decir, qué datos y funciones estarán disponibles globalmente
interface FavoriteHeroContext {
  // ----- STATE -----
  favoriteCount: number; // Cantidad total de héroes favoritos
  favorites: Hero[]; // Lista de héroes favoritos

  // ----- METHODS -----
  ifFavorite: (hero: Hero) => boolean; // Verifica si un héroe es favorito
  toggleFavorite: (hero: Hero) => void; // Agrega o elimina un héroe de favoritos
}

// Creamos el contexto
// Se inicializa con un objeto vacío tipado como FavoriteHeroContext
export const favoriteHeroContext = createContext({} as FavoriteHeroContext);

// Función auxiliar para leer los favoritos desde localStorage
const getFavoritesFromLocalStorage = (): Hero[] => {
  // ⚠️ Nota: aquí podrías validar los datos con Zod para evitar errores
  const favorites = localStorage.getItem("favorites");

  // Si existen datos en localStorage, los parsea
  // Si no, retorna un arreglo vacío
  return favorites ? JSON.parse(favorites) : [];
};

// Provider del contexto
// Este componente envolverá a otros componentes
// y les dará acceso al estado y métodos de favoritos
export const FavoriteHeroProvider = ({ children }: PropsWithChildren) => {
  // Estado que almacena los héroes favoritos
  // Se inicializa leyendo localStorage
  const [favorites, setFavorites] = useState<Hero[]>(
    getFavoritesFromLocalStorage(),
  );

  // Función para agregar o quitar un héroe de favoritos
  const toggleFavorite = (hero: Hero) => {
    // Buscamos si el héroe ya existe en favoritos
    const heroExist = favorites.find((h) => h.id === hero.id);

    if (heroExist) {
      // Si existe, lo eliminamos del arreglo
      const newFavorites = favorites.filter((h) => h.id !== hero.id);
      setFavorites(newFavorites);
      return;
    }

    // Si no existe, lo agregamos a favoritos
    setFavorites([...favorites, hero]);
  };

  // Función que verifica si un héroe está marcado como favorito
  const ifFavorite = (hero: Hero) => {
    // some() retorna true si al menos un héroe coincide
    return favorites.some((h) => h.id === hero.id);
  };

  // useEffect que se ejecuta cada vez que cambia "favorites"
  // Guarda automáticamente los favoritos en localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Retornamos el Provider del contexto
  // Aquí es donde se exponen los estados y métodos
  return (
    <favoriteHeroContext.Provider
      value={{
        // ----- STATE -----
        favoriteCount: favorites.length, // Número de favoritos
        favorites: favorites, // Lista de favoritos

        // ----- METHODS -----
        ifFavorite: ifFavorite,
        toggleFavorite: toggleFavorite,
      }}
    >
      {/* Renderiza los componentes hijos */}
      {children}
    </favoriteHeroContext.Provider>
  );
};
