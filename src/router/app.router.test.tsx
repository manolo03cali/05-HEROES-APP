/**
 * Importo las utilidades de Vitest para definir el suite de pruebas,
 * hacer aserciones y crear mocks de módulos.
 */
import { describe, expect, test, vi } from "vitest";

/**
 * Importo las funciones de React Testing Library que me permiten
 * renderizar componentes y consultar el DOM resultante.
 */
import { render, screen } from "@testing-library/react";

/**
 * Importo utilidades de React Router para simular navegación en memoria
 * (sin navegador real) y poder probar rutas.
 */
import {
  createMemoryRouter,
  Outlet,
  RouterProvider,
  useParams,
} from "react-router";

/**
 * Importo Suspense porque una de las rutas (admin) usa lazy loading,
 * y necesito proveer un fallback mientras se resuelve.
 */
import { Suspense } from "react";

/* =========================================================
   MOCKS — LOS DECLARO ANTES DE IMPORTAR EL ROUTER
   ========================================================= */

/**
 * Mockeo el layout de admin.
 * Lo simplifico a un div con data-testid y un Outlet para que
 * React Router pueda renderizar sus rutas hijas.
 */
vi.mock("@/admin/layouts/AdminLayout", () => ({
  AdminLayout: () => (
    <div data-testid="admin-layout">
      <Outlet />
    </div>
  ),
}));

/**
 * Mockeo la página de admin.
 * Uso __esModule: true porque esta página se carga con lazy()
 * y el dynamic import necesita un default export válido.
 */
vi.mock("@/admin/pages/AdminPage", () => ({
  __esModule: true,
  default: () => <div data-testid="admin-page"></div>,
}));

/**
 * Mockeo la Home para evitar renderizar la implementación real
 * y hacer el test más rápido y aislado.
 */
vi.mock("@/heroes/pages/home/HomePage", () => ({
  HomePage: () => <div data-testid="home-page"></div>,
}));

/**
 * Mockeo el layout principal de héroes.
 * Igual que antes, dejo un Outlet para que se rendericen
 * las rutas hijas dentro del layout.
 */
vi.mock("@/heroes/layouts/HeroesLayout", () => ({
  HeroesLayout: () => (
    <div data-testid="heroes-layout">
      <Outlet />
    </div>
  ),
}));

/**
 * Mockeo la página de detalle de héroe.
 * Uso useParams para simular cómo el componente leería
 * el parámetro dinámico de la URL.
 */
vi.mock("@/heroes/pages/Hero/HeroPage", () => ({
  HeroPage: () => {
    const { idSlug = "" } = useParams();
    return <div data-testid="hero-page">HeroPage: {idSlug};</div>;
  },
}));

/**
 * Mockeo la página de búsqueda.
 */
vi.mock("@/heroes/pages/search/SearchPage", () => ({
  SearchPage: () => <div data-testid="search-page"></div>,
}));

/* =========================================================
   IMPORTO EL ROUTER DESPUÉS DE LOS MOCKS
   ========================================================= */

/**
 * Importo el router real.
 * En este momento Vitest ya tiene registrados los mocks,
 * así que el router se construye usando estas versiones falsas.
 */
import { appRouter } from "./app.router";

/* =========================================================
   SUITE DE PRUEBAS DEL ROUTER
   ========================================================= */

describe("app.router", () => {
  /**
   * Verifico que la configuración de rutas no cambie inesperadamente.
   * Si cambia, el snapshot fallará y me avisará.
   */
  test("should be configured as expected ", () => {
    expect(appRouter.routes).toMatchSnapshot();
  });

  /**
   * Simulo navegar a la raíz "/" y verifico que
   * la Home se renderice correctamente.
   */
  test("should render home page at root path", () => {
    const router = createMemoryRouter(appRouter.routes, {
      initialEntries: ["/"],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("home-page")).toBeDefined();
  });

  /**
   * Simulo navegar a una ruta dinámica de héroe
   * y verifico que el parámetro se muestre.
   */
  test("should render hero page at /heroes/:idSlug path", () => {
    const router = createMemoryRouter(appRouter.routes, {
      initialEntries: ["/heroes/superInteligente"],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("hero-page").innerHTML).toContain(
      "superInteligente",
    );
  });

  /**
   * Simulo navegar a la búsqueda.
   * Uso findBy porque puede haber render asíncrono.
   */
  test("should render search page at /search path", async () => {
    const router = createMemoryRouter(appRouter.routes, {
      initialEntries: ["/search"],
    });

    render(<RouterProvider router={router} />);

    expect(await screen.findByTestId("search-page")).toBeDefined();
  });

  /**
   * Simulo una ruta inexistente y verifico que el router
   * redirija correctamente al home.
   */
  test("should rediret to home page for unknown routes", () => {
    const router = createMemoryRouter(appRouter.routes, {
      initialEntries: ["/otra-pagina"],
    });

    render(<RouterProvider router={router} />);

    expect(screen.getByTestId("home-page")).toBeDefined();
  });

  /**
   * Simulo navegar a /admin.
   * Esta ruta usa lazy loading, por eso envuelvo el router
   * en Suspense para manejar el estado de carga.
   */
  test("should render admin page at /admin", async () => {
    const router = createMemoryRouter(appRouter.routes, {
      initialEntries: ["/admin"],
    });

    render(
      <Suspense fallback={<div>Loading</div>}>
        <RouterProvider router={router} />
      </Suspense>,
    );

    /**
     * Espero a que el layout y la página aparezcan
     * porque el lazy render es asíncrono.
     */
    expect(await screen.findByTestId("admin-layout")).toBeDefined();
    expect(await screen.findByTestId("admin-page")).toBeDefined();

    /**
     * Aquí debug ya muestra el DOM final,
     * no solo el fallback.
     */
    screen.debug();
  });
});
