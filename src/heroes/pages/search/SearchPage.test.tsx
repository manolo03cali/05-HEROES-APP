// Importo utilidades de Testing Library para renderizar componentes,
// buscar elementos en pantalla y esperar comportamientos asíncronos.
import { render, screen, waitFor } from "@testing-library/react";

// Importo funciones de Vitest para estructurar y controlar mis tests.
import { beforeEach, describe, expect, test, vi } from "vitest";

// Importo el componente que quiero probar.
import { SearchPage } from "./SearchPage";

// Uso MemoryRouter para simular navegación y query params.
import { MemoryRouter } from "react-router";

// Importo React Query para proveer el contexto necesario.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Importo la acción que será ejecutada dentro del useQuery.
import { searchHeroesActions } from "@/heroes/actions/search-heroes.action";

// Importo el tipo Hero solo para tipado.
import type { Hero } from "@/heroes/types/hero.interface";

// 🔹 Mockeo la acción que hace la búsqueda.
// Lo hago para evitar llamadas reales y poder controlar qué devuelve.
vi.mock("@/heroes/actions/search-heroes.action");

// Creo una versión tipada del mock para poder manipularlo fácilmente.
const mockSearchHeroesAction = vi.mocked(searchHeroesActions);

// 🔹 Mockeo componentes hijos que no quiero testear aquí.
// Mi objetivo es probar SearchPage, no sus componentes internos.

vi.mock("@/components/custom/CustomJumbotron", () => ({
  CustomJumbotron: () => <div data-testid="custom-jumbotron"></div>,
}));

vi.mock("@/components/custom/CustomBreadcrumbs", () => ({
  CustomBreadcrums: () => <div data-testid="custom-breadcrumps"></div>,
}));

vi.mock("@/heroes/components/HeroStats", () => ({
  HeroStats: () => <div data-testid="herostats"></div>,
}));

vi.mock("./ui/SearchControls", () => ({
  SearchControls: () => <div data-testid="searchControls"></div>,
}));

// Aquí mockeo HeroGrid pero mantengo su comportamiento básico:
// recibe heroes y los renderiza como nombres.
// Así puedo verificar si realmente se están mostrando los resultados.
vi.mock("@/heroes/components/HeroGrid", () => ({
  HeroGrid: ({ heroes }: { heroes: Hero[] }) => (
    <div data-testid="hero-grid">
      {heroes.map((hero) => (
        <div key={hero.id}>{hero.name}</div>
      ))}
    </div>
  ),
}));

// 🔹 Creo una función que genera un QueryClient nuevo por test.
// Esto evita que el cache se comparta entre pruebas.
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Desactivo reintentos para que los tests sean predecibles.
      },
    },
  });

// 🔹 Creo un helper para renderizar el componente con todo su contexto.
const renderSearchPage = (initialEntries: string[] = ["/"]) => {
  // Genero un QueryClient limpio cada vez.
  const queryClient = createTestQueryClient();

  return render(
    // Simulo navegación y query params.
    <MemoryRouter initialEntries={initialEntries}>
      {/* Proveo el contexto de React Query */}
      <QueryClientProvider client={queryClient}>
        <SearchPage />
      </QueryClientProvider>
    </MemoryRouter>,
  );
};

// 🔹 Empiezo el bloque de pruebas del componente.
describe("SearchPage", () => {
  // Antes de cada test:
  beforeEach(() => {
    // Limpio historial de mocks.
    vi.clearAllMocks();

    // Me aseguro de que la acción siempre devuelva algo válido.
    // React Query no permite undefined.
    mockSearchHeroesAction.mockResolvedValue([]);
  });

  // 🔹 Test 1: Verifico valores por defecto.
  test("should render searchPage with default values", () => {
    const { container } = renderSearchPage();

    // Verifico que la acción fue llamada con filtros vacíos.
    expect(mockSearchHeroesAction).toHaveBeenCalledWith({
      category: "",
      name: "",
      sort: "name-asc",
      status: "",
      strength: "",
      team: "",
      universe: "",
    });

    // Verifico el snapshot del DOM renderizado.
    expect(container).toMatchSnapshot();
  });

  // 🔹 Test 2: Verifico query param name.
  test("should call search action with name parameter", () => {
    const { container } = renderSearchPage(["/search?name=superman"]);

    expect(mockSearchHeroesAction).toHaveBeenCalledWith({
      category: "",
      name: "superman",
      sort: "name-asc",
      status: "",
      strength: "",
      team: "",
      universe: "",
    });

    expect(container).toMatchSnapshot();
  });

  // 🔹 Test 3: Verifico query param strength.
  test("should call search action with strength parameter", () => {
    const { container } = renderSearchPage(["/search?strength=6"]);

    expect(mockSearchHeroesAction).toHaveBeenCalledWith({
      category: "",
      name: "",
      sort: "name-asc",
      status: "",
      strength: "6",
      team: "",
      universe: "",
    });

    expect(container).toMatchSnapshot();
  });

  // 🔹 Test 4: Verifico combinación de parámetros.
  test("should call search action with name and strength parameter", () => {
    const { container } = renderSearchPage([
      "/search?name=vladimir&strength=9",
    ]);

    expect(mockSearchHeroesAction).toHaveBeenCalledWith({
      category: "",
      name: "vladimir",
      sort: "name-asc",
      status: "",
      strength: "9",
      team: "",
      universe: "",
    });

    expect(container).toMatchSnapshot();
  });

  // 🔹 Test 5: Verifico que se rendericen resultados reales.
  test("should render HeroGrid with search result", async () => {
    // Creo datos simulados.
    const mockHeroes = [
      { id: "1", name: "Clark Kent" } as unknown as Hero,
      { id: "2", name: "Bruce Wayne" } as unknown as Hero,
    ];

    // Sobrescribo el mock para que devuelva héroes.
    mockSearchHeroesAction.mockResolvedValue(mockHeroes);

    renderSearchPage();

    // Espero a que React Query termine y el DOM se actualice.
    await waitFor(() => {
      expect(screen.getByText("Clark Kent")).toBeDefined();
      expect(screen.getByText("Bruce Wayne")).toBeDefined();
    });
  });
});
