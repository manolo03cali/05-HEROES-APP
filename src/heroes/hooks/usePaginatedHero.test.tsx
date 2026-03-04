// Utilidades para testear hooks de React
import { renderHook, waitFor } from "@testing-library/react";

// Funciones de Vitest para estructurar y mockear pruebas
import { beforeEach, describe, expect, test, vi } from "vitest";

// Hook que vamos a probar
import { usePaginatedHero } from "./usePaginatedHero";

// Tipo de React para componentes que reciben children
import type { PropsWithChildren } from "react";

// React Query: cliente y provider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Acción que consulta la API (esta será mockeada)
import { getHeroesByPageAction } from "../actions/get-heroes-by-page.actions";

/* ------------------------------------------------------------------
   MOCK DE LA ACCIÓN
------------------------------------------------------------------- */
// Reemplazamos la implementación real por una función mock
// para evitar llamadas reales a la API
vi.mock("../actions/get-heroes-by-page.actions", () => ({
  getHeroesByPageAction: vi.fn(),
}));

// Creamos una versión tipada del mock para poder usar mockResolvedValue
const mockGetHeroesByPageAction = vi.mocked(getHeroesByPageAction);

/* ------------------------------------------------------------------
   QUERY CLIENT PARA TESTS
------------------------------------------------------------------- */
// Creamos UN SOLO QueryClient para las pruebas
// (se limpia antes de cada test)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Desactivamos reintentos automáticos
      // para que los tests fallen rápido y de forma controlada
      retry: false,
    },
  },
});

/* ------------------------------------------------------------------
   WRAPPER PARA renderHook
------------------------------------------------------------------- */
// Esta función retorna un componente que envuelve el hook
// con QueryClientProvider, necesario para React Query
const tanStackCustomQueryProvider = () => {
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

/* ------------------------------------------------------------------
   TEST SUITE
------------------------------------------------------------------- */
describe("usePaginatedHero", () => {
  /* --------------------------------------------------------------
     LIMPIEZA ANTES DE CADA TEST
  --------------------------------------------------------------- */
  beforeEach(() => {
    // Limpia llamadas y estados de los mocks
    vi.clearAllMocks();

    // Limpia cache y estado interno de React Query
    queryClient.clear();
  });

  /* --------------------------------------------------------------
     TEST 1: ESTADO INICIAL DEL HOOK
  --------------------------------------------------------------- */
  test("should return the initial state (isLoading)", () => {
    // Renderizamos el hook como si estuviera dentro de React
    const { result } = renderHook(() => usePaginatedHero(1, 6), {
      wrapper: tanStackCustomQueryProvider(),
    });

    // Al inicio, React Query está cargando
    expect(result.current.isLoading).toBe(true);

    // No debe haber error todavía
    expect(result.current.isError).toBe(false);

    // No hay datos aún
    expect(result.current.data).toBeUndefined();
  });

  /* --------------------------------------------------------------
     TEST 2: ESTADO SUCCESS CUANDO LA API RESPONDE
  --------------------------------------------------------------- */
  test("should return success state with data when API succeeds", async () => {
    // Datos simulados que devolverá la API
    const mockHeroesData = {
      total: 20,
      pages: 4,
      heroes: [],
    };

    // Indicamos que la acción mock resuelva correctamente
    mockGetHeroesByPageAction.mockResolvedValue(mockHeroesData);

    // Renderizamos el hook
    const { result } = renderHook(() => usePaginatedHero(1, 6), {
      wrapper: tanStackCustomQueryProvider(),
    });

    // Esperamos hasta que React Query marque el estado como success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Estado final esperado
    expect(result.current.status).toBe("success");

    // Verificamos que la acción fue llamada
    expect(mockGetHeroesByPageAction).toHaveBeenCalled();

    // Verificamos que fue llamada con los argumentos correctos
    expect(mockGetHeroesByPageAction).toHaveBeenCalledWith(
      1, // page
      6, // limit
      "all", // category por defecto
      undefined, // tab no fue enviado
    );
  });

  /* --------------------------------------------------------------
     TEST 3: LLAMADA CON CATEGORÍA PERSONALIZADA
  --------------------------------------------------------------- */
  test("should call getHeroesByPageActions with arguments", async () => {
    const mockHeroesData = {
      total: 20,
      pages: 4,
      heroes: [],
    };

    // Mock exitoso
    mockGetHeroesByPageAction.mockResolvedValue(mockHeroesData);

    // Renderizamos el hook pasando categoría personalizada
    const { result } = renderHook(() => usePaginatedHero(1, 6, "heroes"), {
      wrapper: tanStackCustomQueryProvider(),
    });

    // Esperamos estado success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.status).toBe("success");

    // Confirmamos que la acción fue llamada
    expect(mockGetHeroesByPageAction).toHaveBeenCalled();

    // Verificamos argumentos exactos
    expect(mockGetHeroesByPageAction).toHaveBeenCalledWith(
      1, // page
      6, // limit
      "heroes", // categoría personalizada
      undefined, // tab sigue siendo opcional
    );
  });
});
