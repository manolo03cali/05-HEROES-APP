// 🔹 Utilidades de testing para renderizar componentes y simular eventos
import { fireEvent, render, screen } from "@testing-library/react";

// 🔹 Funciones de Vitest para estructurar y ejecutar tests
import { beforeEach, describe, expect, test, vi } from "vitest";

// 🔹 Componente que vamos a probar
import { HomePage } from "./HomePage";

// 🔹 Router en memoria para simular navegación y query params en tests
import { MemoryRouter } from "react-router";

// 🔹 Hook que obtiene los héroes (lo vamos a mockear)
import { usePaginatedHero } from "@/heroes/hooks/usePaginatedHero";

// 🔹 React Query: necesitamos el provider porque el componente usa queries
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// 🔹 Contexto de favoritos requerido por el componente
import { FavoriteHeroProvider } from "@/heroes/context/FavoriteHeroContext";

/* =========================================================
   MOCK DEL HOOK
   ========================================================= */

// 🔹 Reemplaza la implementación real del hook por un mock
//    Así evitamos llamadas a API y controlamos el resultado
vi.mock("@/heroes/hooks/usePaginatedHero");

// 🔹 Creamos una referencia tipada al mock para poder usar
//    funciones como mockReturnValue o verificar llamadas
const mockUsePaginatedHero = vi.mocked(usePaginatedHero);

// 🔹 Definimos el valor que devolverá el hook en todos los tests
//    Simula una respuesta exitosa sin datos
mockUsePaginatedHero.mockReturnValue({
  data: {
    heroes: [], // lista vacía de héroes
    total: 0, // total de registros
    page: 1, // página actual
    limit: 10, // tamaño de página
  },
  isLoading: false,
  isError: false,
  isSuccess: true,
  status: "succes", // ⚠️ typo, debería ser "success"
} as unknown as ReturnType<typeof usePaginatedHero>);

/* =========================================================
   FUNCIÓN HELPER PARA RENDERIZAR EL COMPONENTE
   ========================================================= */

// 🔹 Esta función encapsula todos los providers necesarios
//    para que el componente funcione en el entorno de test
const renderHomePage = (initialEntries: string[] = ["/"]) => {
  // 🔹 Creamos un cliente nuevo de React Query para cada render
  //    Evita que el cache se comparta entre tests
  const queryClient = new QueryClient();

  return render(
    // 🔹 MemoryRouter permite simular rutas y query params
    <MemoryRouter initialEntries={initialEntries}>
      {/* 🔹 Contexto de favoritos */}
      <FavoriteHeroProvider>
        {/* 🔹 Provider de React Query */}
        <QueryClientProvider client={queryClient}>
          <HomePage />
        </QueryClientProvider>
      </FavoriteHeroProvider>
    </MemoryRouter>,
  );
};

/* =========================================================
   SUITE DE TESTS
   ========================================================= */

describe("HomePage", () => {
  // 🔹 Limpia el historial de llamadas del mock antes de cada test
  //    Evita interferencias entre tests
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================
     TEST 1 — Snapshot
     ========================= */
  test("should render HomePage with default values", () => {
    const { container } = renderHomePage();

    // 🔹 Compara el HTML renderizado con el snapshot guardado
    expect(container).toMatchSnapshot();
  });

  /* =========================
     TEST 2 — Parámetros por defecto
     ========================= */
  test("should call usePaginatedHero with default values", () => {
    renderHomePage();

    // 🔹 Verifica que el hook se llame con los valores por defecto
    expect(mockUsePaginatedHero).toHaveBeenCalledWith(1, 6, "all", "all");
  });

  /* =========================
     TEST 3 — Query params personalizados
     ========================= */
  test("should call usePaginatedHero with custom query params", () => {
    // 🔹 Simula entrar a la página con query params
    renderHomePage(["/?page=2&limit=10&category=villains"]);

    // 🔹 Verifica que el hook reciba los valores de la URL
    expect(mockUsePaginatedHero).toHaveBeenCalledWith(2, 10, "villains", "all");
  });

  /* =========================
     TEST 4 — Cambio de tab
     ========================= */
  test("should call usePaginatedHero with default page and same on tab clicked", () => {
    // 🔹 Simula navegación con tab favorites activo
    renderHomePage(["/?tab=favorites&page=2&limit=10"]);

    // 🔹 Obtiene todos los elementos con role="tab"
    //    y selecciona el cuarto (villains)
    const [, , , villainsTab] = screen.getAllByRole("tab");

    // 🔹 Simula click en la pestaña
    fireEvent.click(villainsTab);

    // 🔹 Verifica que al cambiar de tab se reinicie la página
    //    y se llamen los parámetros correctos
    expect(mockUsePaginatedHero).toHaveBeenCalledWith(
      1,
      10,
      "Villain",
      "villains",
    );
  });
});
