// Importamos el tipo Hero para que TypeScript sepa la forma de cada héroe
import type { Hero } from "../types/hero.interface";

// Importamos el componente que va a renderizar cada tarjeta individual
import { HeroGridCard } from "./HeroGridCard";

// Definimos la interfaz de las props que recibe este componente.
// En este caso, solo recibe un arreglo de héroes.
interface HeroGridProps {
  heroes: Hero[];
}

// Componente HeroGrid: recibe la lista de héroes y la muestra en una cuadrícula
export const HeroGrid = ({ heroes }: HeroGridProps) => {
  return (
    // Contenedor principal con clases de Tailwind para hacer una cuadrícula responsiva
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
      {/* Recorremos el arreglo de héroes y por cada uno renderizamos una tarjeta */}
      {heroes.map((hero) => (
        // HeroGridCard es el componente que muestra cada héroe
        // La key es necesaria para que React identifique cada elemento único
        <HeroGridCard key={hero.id} hero={hero} />
      ))}
    </div>
  );
};
