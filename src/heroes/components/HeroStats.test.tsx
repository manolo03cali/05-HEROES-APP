// Importo funciones de Testing Library.
// - render: para montar el componente en el entorno de test
// - screen: para consultar lo que se renderiza en el DOM
import { render, screen } from "@testing-library/react";

// Importo utilidades de Vitest para definir y ejecutar los tests
import { describe, expect, test, vi } from "vitest";

// Importo el componente que quiero probar
import { HeroStats } from "./HeroStats";

// Importo React Query porque el componente depende de él
// Necesito envolver HeroStats en un QueryClientProvider
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Importo el hook que usa HeroStats internamente
// Este hook lo voy a mockear para controlar la data que devuelve
import { useHeroSummary } from "../hooks/useHeroSummary";

// Importo el tipo de la respuesta para tipar correctamente los mocks
import type { SummaryInformationResponse } from "../types/summary-information.response";

// Importo el Provider de favoritos porque HeroStats depende del contexto
import { FavoriteHeroProvider } from "../context/FavoriteHeroContext";

// Mockeo completamente el hook useHeroSummary
// Así evito llamadas reales y controlo exactamente la data
vi.mock("../hooks/useHeroSummary");

// Creo una versión mockeada del hook para poder definir su retorno
const mockUseHeroSummary = vi.mocked(useHeroSummary);

// Creo un héroe mock que usaré para simular favoritos en localStorage
const mockHero = {
  id: "1",
  name: "Clark Kent",
  slug: "clark-kent",
  alias: "Superman",
  powers: [
    "Súper fuerza",
    "Vuelo",
    "Visión de calor",
    "Visión de rayos X",
    "Invulnerabilidad",
    "Súper velocidad",
  ],
  description:
    "El Último Hijo de Krypton, protector de la Tierra y símbolo de esperanza para toda la humanidad.",
  strength: 10,
  intelligence: 8,
  speed: 9,
  durability: 10,
  team: "Liga de la Justicia",
  image: "1.jpeg",
  firstAppearance: "1938",
  status: "Active",
  category: "Hero",
  universe: "DC",
  favorite: false,
  type: "superhero",
};

// Creo un mock completo de la información resumen
// Esto simula lo que devolvería el backend
const mockSummaryData: SummaryInformationResponse = {
  totalHeroes: 25,
  strongestHero: {
    id: "1",
    name: "Clark Kent",
    slug: "clark-kent",
    alias: "Superman",
    powers: [
      "Súper fuerza",
      "Vuelo",
      "Visión de calor",
      "Visión de rayos X",
      "Invulnerabilidad",
      "Súper velocidad",
    ],
    description:
      "El Último Hijo de Krypton, protector de la Tierra y símbolo de esperanza para toda la humanidad.",
    strength: 10,
    intelligence: 8,
    speed: 9,
    durability: 10,
    team: "Liga de la Justicia",
    image: "1.jpeg",
    firstAppearance: "1938",
    status: "Active",
    category: "Hero",
    universe: "DC",
    favorite: false,
    type: "superhero",
  },
  smartestHero: {
    id: "2",
    name: "Bruce Wayne",
    slug: "bruce-wayne",
    alias: "Batman",
    powers: [
      "Artes marciales",
      "Habilidades de detective",
      "Tecnología avanzada",
      "Sigilo",
      "Genio táctico",
    ],
    description:
      "El Caballero Oscuro de Ciudad Gótica, que utiliza el miedo como arma contra el crimen y la corrupción.",
    strength: 6,
    intelligence: 10,
    speed: 6,
    durability: 7,
    team: "Liga de la Justicia",
    image: "2.jpeg",
    firstAppearance: "1939",
    status: "Active",
    category: "Hero",
    universe: "DC",
    favorite: false,
    type: "superhero",
  },
  heroCount: 18,
  villainCount: 7,
  favoriteCount: 0,
};

// Creo un QueryClient exclusivo para testing
// Desactivo el retry para evitar comportamientos inesperados
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Creo una función helper para renderizar HeroStats
// Aquí controlo qué devuelve el hook useHeroSummary
const renderHeroStats = (mockData?: Partial<SummaryInformationResponse>) => {
  // Si me pasan data mock, la retorno desde el hook
  if (mockData) {
    mockUseHeroSummary.mockReturnValue({
      data: mockData,
    } as unknown as ReturnType<typeof useHeroSummary>);
  } else {
    // Si no me pasan data, simulo estado de carga
    mockUseHeroSummary.mockReturnValue({
      data: undefined,
    } as unknown as ReturnType<typeof useHeroSummary>);
  }

  // Renderizo el componente envuelto en todos los providers necesarios
  return render(
    <QueryClientProvider client={queryClient}>
      <FavoriteHeroProvider>
        <HeroStats />
      </FavoriteHeroProvider>
    </QueryClientProvider>,
  );
};

// Agrupo todos los tests del componente HeroStats
describe("HeroStats", () => {
  // TEST 1
  // Verifico que el componente muestre el estado de carga
  test("should render component with default values", () => {
    const { container } = renderHeroStats();

    // Espero que aparezca el texto de loading
    expect(screen.getByText("Loading...")).toBeDefined();

    // Guardo snapshot del estado inicial
    expect(container).toMatchSnapshot();
  });

  // TEST 2
  // Verifico que el componente renderice correctamente
  // cuando recibe información desde el hook
  test("should render HeroStats with mock information", () => {
    const { container } = renderHeroStats(mockSummaryData);

    //screen.debug();

    // Comparo el render con el snapshot esperado
    expect(container).toMatchSnapshot();

    // Verifico que ciertos textos clave estén presentes
    expect(screen.queryByText("Total de personajes")).toBeDefined();
    expect(screen.queryByText("Favoritos")).toBeDefined();
    expect(screen.queryByText("Fuerte")).toBeDefined();
  });

  // TEST 3
  // Verifico que el porcentaje de favoritos cambie
  // cuando existe un héroe guardado en localStorage
  test("should change the percentege of favorites when a hero is added to favorites", () => {
    // Simulo que hay un héroe favorito guardado
    localStorage.setItem("favorites", JSON.stringify([mockHero]));

    renderHeroStats(mockSummaryData);

    // Obtengo el elemento que muestra el porcentaje
    const favoritePercentageElement = screen.getByTestId("favorite-percentage");

    // Verifico el valor exacto
    expect(favoritePercentageElement.textContent).toBe("4.00% of total");
    expect(favoritePercentageElement.innerHTML).toContain("4.00% of total");

    // Verifico que el contador de favoritos sea correcto
    const favoriteCountElement = screen.getByTestId("favorite-count");
    //para observar un elemento especifico al momento de hacer un debug, esta es la forma:
    screen.debug(favoriteCountElement);
    expect(favoriteCountElement.textContent).toBe("1");
    expect(favoriteCountElement.innerHTML).toContain("1");
  });
});
