// Importo utilidades de testing-library para renderizar componentes
// y simular eventos de usuario en el DOM
import { fireEvent, render, screen } from "@testing-library/react";

// Importo funciones de Vitest para estructurar y ejecutar las pruebas
import { describe, expect, test, vi } from "vitest";

// Importo el componente que voy a probar
import { CustomPagination } from "./CustomPagination";

// Importo MemoryRouter para simular la navegación sin un navegador real
import { MemoryRouter } from "react-router";

// Importo el tipo para poder tipar correctamente children en el mock
import type { PropsWithChildren } from "react";

//  Aquí hago un MOCK del componente Button
// Lo reemplazo por un botón HTML simple porque no me interesa probar
// la implementación real del botón sino el comportamiento de la paginación
vi.mock("../ui/button", () => ({
  Button: ({ children, ...props }: PropsWithChildren) => (
    <button {...props}>{children}</button>
  ),
}));

//  Creo una función helper para renderizar el componente
// dentro de un router simulado.
// Esto me permite controlar la URL inicial (por ejemplo ?page=3)
const renderWithRouter = (
  component: React.ReactElement,
  initialEntries?: string[],
) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>{component}</MemoryRouter>,
  );
};

//  Agrupo todas las pruebas relacionadas con CustomPagination
describe("CustomPagination", () => {
  // Verifico que el componente renderice correctamente
  // con los valores por defecto
  test("should render component with default values", () => {
    // Renderizo con 5 páginas totales
    renderWithRouter(<CustomPagination totalPages={5} />);

    // Compruebo que existen los botones principales
    expect(screen.getByText("Anteriores")).toBeDefined();
    expect(screen.getByText("Siguientes")).toBeDefined();

    // Compruebo que se renderizan los números de página
    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
  });

  //  Verifico que el botón "Anteriores" esté deshabilitado
  // cuando estoy en la página 1
  test("should disabled previous button when page is 1", () => {
    renderWithRouter(<CustomPagination totalPages={5} />);

    // Busco el botón
    const previousButton = screen.getByText("Anteriores");

    // Compruebo que tenga el atributo disabled
    expect(previousButton.getAttributeNames()).toContain("disabled");
  });

  // Verifico que el botón "Siguientes" se deshabilite
  // cuando estoy en la última página
  test("should disabled next button when are in the last page", () => {
    // Inicio el router simulando que la URL tiene ?page=5
    renderWithRouter(<CustomPagination totalPages={5} />, ["/?page=5"]);

    const nextButton = screen.getByText("Siguientes");

    // Compruebo que esté deshabilitado
    expect(nextButton.getAttributeNames()).toContain("disabled");
  });

  // Verifico que el botón de la página actual tenga el estilo activo
  test("should disabled button 3 when are in page 3", () => {
    renderWithRouter(<CustomPagination totalPages={10} />, ["/?page=3"]);

    const button2 = screen.getByText("2");
    const button3 = screen.getByText("3");

    // La página 2 debería verse como botón normal (outline)
    expect(button2.getAttribute("variant")).toBe("outline");

    // La página actual (3) debería verse activa (default)
    expect(button3.getAttribute("variant")).toBe("default");
  });

  // Verifico que al hacer click en un número cambie la página
  test("should change page when click on number button", () => {
    renderWithRouter(<CustomPagination totalPages={10} />, ["/?page=3"]);

    const button2 = screen.getByText("2");
    const button3 = screen.getByText("3");

    // Confirmo estado inicial
    expect(button2.getAttribute("variant")).toBe("outline");
    expect(button3.getAttribute("variant")).toBe("default");

    // Simulo el click en la página 2
    fireEvent.click(button2);

    // Después del click, los estilos deberían invertirse
    expect(button2.getAttribute("variant")).toBe("default");
    expect(button3.getAttribute("variant")).toBe("outline");
  });
});
