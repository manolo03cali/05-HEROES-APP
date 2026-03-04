// Importo el hook `use` desde React.
// Lo uso para consumir directamente un contexto dentro de un componente de prueba.
import { use } from "react";

// Importo utilidades de Testing Library.
// - render: para montar componentes en un entorno de testing
// - screen: para buscar elementos renderizados en el DOM
// - fireEvent: para simular eventos del usuario, como clicks
import { fireEvent, render, screen } from "@testing-library/react";

// Importo las funciones de Vitest que necesito para estructurar mis tests
import { beforeEach, describe, expect, test, vi } from "vitest";

// Importo el contexto que quiero probar y su Provider real.
// El Provider es clave porque ahí vive toda la lógica que estoy testeando.
import {
  favoriteHeroContext,
  FavoriteHeroProvider,
} from "./FavoriteHeroContext";

// Importo el tipo Hero solo para tipar correctamente mi mock.
// No me interesa el Hero real completo, solo cumplir el tipo.
import type { Hero } from "../types/hero.interface";

// Creo un héroe falso (mock) que voy a usar en todos los tests.
// Uso `as unknown as Hero` porque no estoy llenando todas las propiedades reales.
const mockHero = { id: 1, name: "Batman" } as unknown as Hero;

// Creo un mock de localStorage.
// Esto me permite interceptar y verificar llamadas a getItem y setItem
// sin depender del localStorage real del navegador.
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};

// Reemplazo el localStorage real por mi mock dentro del entorno de testing.
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Creo un componente de prueba.
// Este componente existe solo para consumir el contexto como lo haría
// cualquier componente real de la aplicación.
const TestComponent = () => {
  // Aquí consumo el contexto usando `use(context)`.
  // Extraigo exactamente lo que quiero validar en los tests.
  const { favoriteCount, favorites, ifFavorite, toggleFavorite } =
    use(favoriteHeroContext);

  // Renderizo información del contexto en el DOM
  // para luego poder hacer asserts con Testing Library.
  return (
    <div>
      {/* Muestro la cantidad total de favoritos */}
      <div data-testid="favorite-count">{favoriteCount}</div>

      {/* Renderizo la lista de héroes favoritos */}
      <div data-testid="favorite-list">
        {favorites.map((hero) => (
          <div key={hero.id} data-testid={`hero-${hero.id}`}>
            {hero.name}
          </div>
        ))}
      </div>

      {/* Botón que ejecuta toggleFavorite con el héroe mock */}
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

// Creo una función helper para no repetir código en cada test.
// Aquí renderizo el TestComponent envuelto en el Provider real del contexto.
const renderContextTest = () => {
  return render(
    <FavoriteHeroProvider>
      <TestComponent />
    </FavoriteHeroProvider>,
  );
};

// Agrupo todos los tests relacionados con FavoriteHeroContext
describe("FavoriteHeroContext", () => {
  // Antes de cada test limpio los mocks
  // para evitar que un test afecte a otro.
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // TEST 1
  // Verifico que el contexto se inicialice con valores por defecto.
  test("should initialize with default values ", () => {
    renderContextTest();

    // Imprimo el DOM para poder inspeccionarlo si algo falla
    screen.debug();

    // Espero que el contador de favoritos empiece en 0
    expect(screen.getByTestId("favorite-count").textContent).toBe("0");

    // Espero que la lista de favoritos esté vacía
    expect(screen.getByTestId("favorite-list").children.length).toBe(0);
  });

  // TEST 2
  // Verifico que al llamar toggleFavorite con un héroe nuevo,
  // este se agregue correctamente a favoritos.
  test("should add Hero to favorites when toggle is called with new hero ", () => {
    renderContextTest();

    // Obtengo el botón que dispara toggleFavorite
    const button = screen.getByTestId("toggle-favorite");

    // Simulo un click del usuario
    fireEvent.click(button);

    screen.debug();

    // Ahora debería haber 1 favorito
    expect(screen.getByTestId("favorite-count").textContent).toBe("1");

    // ifFavorite debería devolver true para el héroe mock
    expect(screen.getByTestId("if-favorite").textContent).toBe("true");

    // El héroe debería aparecer renderizado en la lista
    expect(screen.getByTestId("hero-1").textContent).toBe("Batman");

    // Verifico que se haya guardado en localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "favorites",
      '[{"id":1,"name":"Batman"}]',
    );
  });

  // TEST 3
  // Verifico que si el héroe ya existe en favoritos,
  // toggleFavorite lo elimine correctamente.
  test("should remove Hero from favorites when toggleFavorite is called", () => {
    // Simulo que el héroe ya estaba guardado en localStorage
    localStorageMock.getItem.mockReturnValue(JSON.stringify([mockHero]));

    renderContextTest();

    // Confirmo que el estado inicial se cargó desde localStorage
    expect(screen.getByTestId("favorite-count").textContent).toBe("1");
    expect(screen.getByTestId("if-favorite").textContent).toBe("true");
    expect(screen.getByTestId("hero-1").textContent).toBe("Batman");

    // Simulo el click para quitar el héroe
    const button = screen.getByTestId("toggle-favorite");
    fireEvent.click(button);

    // Verifico que el héroe fue eliminado
    expect(screen.getByTestId("favorite-count").textContent).toBe("0");
    expect(screen.getByTestId("if-favorite").textContent).toBe("false");
    expect(screen.queryByTestId("hero-1")).toBeNull();

    // Verifico que localStorage se haya actualizado
    expect(localStorageMock.setItem).toHaveBeenCalled();
    expect(localStorageMock.setItem).toHaveBeenCalledWith("favorites", "[]");
  });
});
