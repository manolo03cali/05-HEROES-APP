// 🔹 Importo las funciones básicas para estructurar mis pruebas
import { describe, expect, test } from "vitest";

// 🔹 Importo el componente que quiero probar
import { SearchControls } from "./SearchControls";

// 🔹 MemoryRouter me permite simular rutas y query params en los tests
import { MemoryRouter } from "react-router";

// 🔹 Herramientas para renderizar y simular eventos como si fuera un usuario
import { fireEvent, render, screen } from "@testing-library/react";

// 🔹 Algunos componentes (como Radix UI o sliders)
// usan ResizeObserver, pero JSDOM no lo implementa.
// Entonces creo un mock simple para evitar errores en los tests.
if (typeof window.ResizeObserver === "undefined") {
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  // Lo asigno al window para que el componente no falle
  window.ResizeObserver = ResizeObserver;
}

// 🔹 Creo una función reutilizable para renderizar el componente
// dentro de un MemoryRouter.
// Puedo pasarle rutas con query params.
const renderWithRouter = (initialEntries: string[] = ["/"]) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <SearchControls />
    </MemoryRouter>,
  );
};

// 🔹 Agrupo todas las pruebas relacionadas con SearchControls
describe("SearchControls", () => {
  // ✅ 1️⃣ Verifico que el componente renderiza correctamente
  test("should render SearchControls with default values", () => {
    const { container } = renderWithRouter();

    // Comparo el HTML renderizado con el snapshot guardado
    expect(container).toMatchSnapshot();
  });

  // ✅ 2️⃣ Verifico que el input tome el valor desde el query param "name"
  test("should set input value search param name is set", () => {
    // Simulo que la URL tiene ?name=Batman
    renderWithRouter(["/?name=Batman"]);

    // Busco el input por su placeholder
    const input = screen.getByPlaceholderText(
      "Search heroes, villains, powers, teams...",
    );

    // Verifico que el valor del input sea "Batman"
    expect(input.getAttribute("value")).toBe("Batman");
  });

  // ✅ 3️⃣ Verifico que el input cambie cuando escribo y presiono Enter
  test("should change params when input is changed and enter is pressed", () => {
    // Inicio con name=Batman
    renderWithRouter(["/?name=Batman"]);

    const input = screen.getByPlaceholderText(
      "Search heroes, villains, powers, teams...",
    );

    // Confirmo que empieza en Batman
    expect(input.getAttribute("value")).toBe("Batman");

    // Simulo que el usuario escribe "Superman"
    fireEvent.change(input, { target: { value: "Superman" } });

    // Simulo que presiona Enter
    fireEvent.keyDown(input, { key: "Enter" });

    // Verifico que ahora el input tenga Superman
    expect(input.getAttribute("value")).toBe("Superman");
  });

  // ✅ 4️⃣ Verifico que el slider cambie cuando uso las flechas del teclado
  test("should change params strength when slider is changed ", () => {
    // Activo el accordion desde el query param
    renderWithRouter(["/?name=Batman&active-accordion=advance-filters"]);

    // Busco el slider por su rol accesible
    const slider = screen.getByRole("slider");

    // Verifico que empiece en 0
    expect(slider.getAttribute("aria-valuenow")).toBe("0");

    // Simulo que presiono flecha derecha
    fireEvent.keyDown(slider, { key: "ArrowRight" });

    // Verifico que ahora valga 1
    expect(slider.getAttribute("aria-valuenow")).toBe("1");
  });

  // ✅ 5️⃣ Verifico que el accordion esté abierto
  // cuando el query param active-accordion está presente
  test("should accordion be open when active acordion param is set", () => {
    renderWithRouter(["/?name=Batman&active-accordion=advance-filters"]);

    // Obtengo el contenedor principal del accordion
    const accordion = screen.getByTestId("accordion");

    // Busco el primer div interno (el item del accordion)
    const accordionItem = accordion.querySelector("div");

    // Verifico que su estado sea "open"
    expect(accordionItem?.getAttribute("data-state")).toBe("open");
  });

  // ✅ 6️⃣ Verifico que el accordion esté cerrado
  // cuando no existe el query param
  test("should accordion be close when active acordion param is not set", () => {
    renderWithRouter(["/?name=Batman"]);

    const accordion = screen.getByTestId("accordion");
    const accordionItem = accordion.querySelector("div");

    // Debe estar cerrado
    expect(accordionItem?.getAttribute("data-state")).toBe("closed");
  });
});
