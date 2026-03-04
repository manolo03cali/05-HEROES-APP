// Importo el hook `use` de React para poder consumir un contexto directamente.
// En este test lo uso para leer el FavoriteHeroContext dentro de un componente de prueba.
import { use } from "react";

// Importo utilidades de Testing Library:
// - render: para montar componentes en un entorno de prueba
// - screen: para consultar el DOM renderizado
// - fireEvent: para simular eventos como clicks
import { fireEvent, render, screen } from "@testing-library/react";

// Importo funciones de Vitest para estructurar y ejecutar los tests
import { beforeEach, describe, expect, test } from "vitest";

// Importo el contexto y su Provider, que es lo que realmente quiero probar
import {
  favoriteHeroContext,
  FavoriteHeroProvider,
} from "./FavoriteHeroContext";

// Importo el tipo Hero solo para tipar correctamente el mock
import type { Hero } from "../types/hero.interface";

// Creo un héroe falso (mock) que voy a usar en los tests.
// Uso `as unknown as Hero` porque no estoy llenando todas las propiedades reales del Hero.
const mockHero = { id: 1, name: "Batman" } as unknown as Hero;

// Este es un componente de prueba.
// Lo creo SOLO para poder consumir el contexto como lo haría un componente real.
const TestComponent = () => {
  // Aquí consumo el contexto usando `use(context)`
  // Extraigo exactamente lo que quiero probar
  const { favoriteCount, favorites, ifFavorite, toggleFavorite } =
    use(favoriteHeroContext);

  // Renderizo información del contexto en el DOM para poder hacer asserts en los tests
  return (
    <div>
      {/* Muestro la cantidad de favoritos */}
      <div data-testid="favorite-count">{favoriteCount}</div>

      {/* Muestro la lista de héroes favoritos */}
      <div data-testid="favorite-list">
        {favorites.map((hero) => (
          <div key={hero.id} data-testid={`hero-${hero.id}`}>
            {hero.name}
          </div>
        ))}
      </div>

      {/* Botón para ejecutar toggleFavorite con el héroe mock */}
      <button
        data-testid="toggle-favorite"
        onClick={() => toggleFavorite(mockHero)}
      >
        Toggle Favorite
      </button>

      {/* Muestro si el héroe mock es favorito o no */}
      <div data-testid="if-favorite">{ifFavorite(mockHero).toString()}</div>
    </div>
  );
};

// Esta función me ayuda a no repetir código.
// Renderizo el TestComponent envuelto dentro del Provider real del contexto.
const renderContextTest = () => {
  return render(
    <FavoriteHeroProvider>
      <TestComponent />
    </FavoriteHeroProvider>,
  );
};

// Agrupo todos los tests relacionados con FavoriteHeroContext
describe("FavoriteHeroContext", () => {
  // Antes de cada test limpio el localStorage
  // Esto es clave porque el contexto depende de datos persistidos
  beforeEach(() => {
    localStorage.clear();
  });

  // Test 1: Verifico que el contexto arranque con valores por defecto
  test("should initialize with default values ", () => {
    renderContextTest();

    // Imprimo el DOM para depurar si algo falla
    screen.debug();

    // Espero que el contador de favoritos empiece en 0
    expect(screen.getByTestId("favorite-count").textContent).toBe("0");

    // Espero que no haya ningún héroe en la lista
    expect(screen.getByTestId("favorite-list").children.length).toBe(0);
  });

  // Test 2: Verifico que al hacer toggle con un héroe nuevo se agregue a favoritos
  test("should add Hero to favorites when toggle is called with new hero ", () => {
    renderContextTest();

    // Obtengo el botón de toggle
    const button = screen.getByTestId("toggle-favorite");

    // Simulo un click en el botón
    fireEvent.click(button);

    screen.debug();

    // Espero que ahora haya 1 favorito
    expect(screen.getByTestId("favorite-count").textContent).toBe("1");

    // Espero que ifFavorite devuelva true
    expect(screen.getByTestId("if-favorite").textContent).toBe("true");

    // Espero que el héroe aparezca renderizado
    expect(screen.getByTestId("hero-1").textContent).toBe("Batman");

    // Verifico que también se haya guardado en localStorage
    expect(localStorage.getItem("favorites")).toBe(
      '[{"id":1,"name":"Batman"}]',
    );
  });

  // Test 3: Verifico que si el héroe ya existe, toggleFavorite lo quite
  test("should remove Hero from favorites when toggleFavorite is called", () => {
    // Simulo que el héroe ya estaba guardado antes de renderizar
    localStorage.setItem("favorites", JSON.stringify([mockHero]));

    renderContextTest();

    // Confirmo el estado inicial cargado desde localStorage
    expect(screen.getByTestId("favorite-count").textContent).toBe("1");
    expect(screen.getByTestId("if-favorite").textContent).toBe("true");
    expect(screen.getByTestId("hero-1").textContent).toBe("Batman");

    // Hago click para quitar el héroe
    const button = screen.getByTestId("toggle-favorite");
    fireEvent.click(button);

    // Verifico que el héroe fue eliminado
    expect(screen.getByTestId("favorite-count").textContent).toBe("0");
    expect(screen.getByTestId("if-favorite").textContent).toBe("false");
    expect(screen.queryByTestId("hero-1")).toBeNull();
  });
});
