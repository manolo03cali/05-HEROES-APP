// Importo el tipo PropsWithChildren para tipar componentes
// que reciben children (contenido interno)
import type { PropsWithChildren } from "react";

// Importo las utilidades de Vitest para escribir pruebas
import { beforeEach, describe, expect, test, vi } from "vitest";

// Importo helpers para probar hooks de React
import { renderHook, waitFor } from "@testing-library/react";

// Importo el hook que voy a probar
import { useHeroSummary } from "./useHeroSummary";

// Importo lo necesario para React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Importo la acción que llama a la API (esta la voy a mockear)
import { getSummaryActions } from "../actions/get-summary.actions";

// Importo el tipo de la respuesta esperada
import type { SummaryInformationResponse } from "../types/summary-information.response";

// Aquí le digo a Vitest que "finja" (mockee) el módulo
// get-summary.actions. No quiero llamar a la API real en las pruebas.
vi.mock("../actions/get-summary.actions", () => ({
  getSummaryActions: vi.fn(),
}));

// Creo una versión tipada del mock para poder usar mockResolvedValue,
// mockRejectedValue, etc., sin errores de TypeScript
const mockedGetSummaryActions = vi.mocked(getSummaryActions);

// Esta función crea un wrapper personalizado para React Query
// Yo la necesito porque mi hook usa useQuery y requiere un QueryClientProvider
const tanStackCustomQueryProvider = () => {
  // Creo un QueryClient específico para pruebas
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Desactivo los reintentos automáticos
        // para que los tests fallen rápido y de forma controlada
        retry: false,
      },
    },
  });

  // Retorno un componente que envuelve los children
  // con el QueryClientProvider
  return ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Agrupo todas las pruebas del hook useHeroSummary
describe("useHeroSummary", () => {
  // Antes de cada test limpio los mocks
  // para evitar que un test afecte a otro
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // PRIMER TEST: estado inicial del hook
  test("should return the initial state(isLoading)", () => {
    // Renderizo el hook usando renderHook
    // y le paso el wrapper con React Query
    const { result } = renderHook(() => useHeroSummary(), {
      wrapper: tanStackCustomQueryProvider(),
    });

    // Verifico que al inicio esté cargando
    expect(result.current.isLoading).toBe(true);

    // Verifico que no haya error
    expect(result.current.isError).toBe(false);

    // Verifico que aún no exista data
    expect(result.current.data).toBe(undefined);
    expect(result.current.data).toBeUndefined();
  });

  // SEGUNDO TEST: cuando la llamada a la API es exitosa
  test("should return success state with data when API call succeds", async () => {
    // Creo datos simulados como si vinieran del backend
    const mockSummaryData = {
      totalHeroes: 10,
      strongestHero: {
        id: "1",
        name: "Clark Kent",
        slug: "clark-kent",
      },
      smartestHero: {
        id: "2",
        name: "Bruce Wayne",
        slug: "bruce-wayne",
      },
      heroCount: 18,
      villainCount: 7,
    } as SummaryInformationResponse;

    // Le digo al mock que resuelva la promesa con estos datos
    mockedGetSummaryActions.mockResolvedValue(mockSummaryData);

    // Renderizo nuevamente el hook
    const { result } = renderHook(() => useHeroSummary(), {
      wrapper: tanStackCustomQueryProvider(),
    });

    // Espero hasta que el hook esté en estado success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verifico que no haya error
    expect(result.current.isError).toBe(false);

    // Verifico que la función mockeada sí fue llamada
    expect(mockedGetSummaryActions).toHaveBeenCalled();

    // Verifico que fue llamada sin argumentos
    expect(mockedGetSummaryActions).toHaveBeenCalledWith();
  });

  // TERCER TEST: cuando la llamada a la API falla
  test("should return error state when API call fails", async () => {
    // Creo un error simulado
    const mockError = new Error("Failed to fetch summary");

    // Le digo al mock que rechace la promesa con un error
    mockedGetSummaryActions.mockRejectedValue(mockError);

    // Renderizo el hook
    const { result } = renderHook(() => useHeroSummary(), {
      wrapper: tanStackCustomQueryProvider(),
    });

    // Espero hasta que el hook entre en estado de error
    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Verifico que el error exista
    expect(result.current.error).toBeDefined();

    // Verifico que ya no esté cargando
    expect(result.current.isLoading).toBe(false);

    // Verifico que la acción haya sido llamada
    expect(mockedGetSummaryActions).toHaveBeenCalled();

    // Verifico que solo se haya llamado una vez
    expect(mockedGetSummaryActions).toHaveBeenCalledTimes(1);

    expect(result.current.error?.message).toBe("Failed to fetch summary");

    // Imprimo el error en consola (útil para depuración)
    console.log(result.current.error);
  });
});
