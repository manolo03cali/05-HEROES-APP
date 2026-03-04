// Importo useRef para poder acceder directamente al input de búsqueda
import { useRef } from "react";

// Componentes UI reutilizables
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Iconos para botones
import { Search, Filter, SortAsc, Grid, Plus } from "lucide-react";

// Hook para leer y modificar los query params de la URL
import { useSearchParams } from "react-router";

// Slider para el filtro de fuerza mínima
import { Slider } from "@/components/ui/slider";

// Componentes para el acordeón de filtros avanzados
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";

// Acciones que traen datos desde backend
import { getTeamsAction } from "@/heroes/actions/get-team.actions";
import { getCategoriesAction } from "@/heroes/actions/get-category.actions";
import { getUniversesAction } from "@/heroes/actions/get-universe.actions";
import { getStatusesAction } from "@/heroes/actions/get-statuse.action";

// Hook personalizado que maneja filtros dinámicos
import { useFilter } from "@/heroes/hooks/useFilter";

export const SearchControls = () => {
  // Leo los parámetros actuales de la URL y tengo función para modificarlos
  const [searchParams, setSearchParams] = useSearchParams();

  // Referencia al input de búsqueda para leer su valor cuando presionen Enter
  const inputRef = useRef<HTMLInputElement>(null);

  // Cada filtro usa el mismo hook reutilizable.
  // Le paso el nombre del parámetro y la acción que trae las opciones.
  const teamFilter = useFilter("team", getTeamsAction);
  const categoryFilter = useFilter("category", getCategoriesAction);
  const universeFilter = useFilter("universe", getUniversesAction);
  const statuseFilter = useFilter("status", getStatusesAction);

  // Leo qué acordeón está activo desde la URL
  const activeAccordion = searchParams.get("active-accordion") ?? "";

  // Leo la fuerza mínima seleccionada (si no existe, es 0)
  const selectedStrength = Number(searchParams.get("strength") ?? "0");

  // Función helper para actualizar query params sin perder los anteriores
  const setQueryParams = (name: string, value: string) => {
    setSearchParams((prev) => {
      prev.set(name, value);
      return prev;
    });
  };

  // Obtengo el parámetro de ordenamiento (default ascendente)
  const sortParam = searchParams.get("sort") ?? "name-asc";

  // Alterna entre orden ascendente y descendente
  const toggleSort = () => {
    const nextSort = sortParam === "name-asc" ? "name-desc" : "name-asc";
    setQueryParams("sort", nextSort);
  };

  // Cuando el usuario presiona Enter en el input
  // Tomo el valor actual y lo guardo en la URL como ?name=...
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const value = inputRef.current?.value ?? "";
      setQueryParams("name", value);
    }
  };

  return (
    <>
      {/* Contenedor principal de búsqueda y botones */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        {/* ================= SEARCH INPUT ================= */}
        <div className="relative flex-1">
          {/* Icono dentro del input */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />

          {/* Input de búsqueda */}
          <Input
            ref={inputRef}
            placeholder="Search heroes, villains, powers, teams..."
            className="pl-12 h-12 text-lg bg-white"
            onKeyDown={handleKeyDown}
            defaultValue={searchParams.get("name") ?? ""}
          />
        </div>

        {/* ================= ACTION BUTTONS ================= */}
        <div className="flex gap-2">
          {/* Botón que abre/cierra filtros avanzados */}
          <Button
            variant={
              activeAccordion === "advance-filters" ? "default" : "outline"
            }
            className="h-12"
            onClick={() => {
              // Si ya está abierto, lo cierro
              if (activeAccordion === "advance-filters") {
                setQueryParams("active-accordion", "");
                return;
              }
              // Si está cerrado, lo abro
              setQueryParams("active-accordion", "advance-filters");
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          {/* Botón para ordenar por nombre */}
          <Button
            variant="outline"
            className="h-12 bg-transparent"
            onClick={toggleSort}
          >
            <SortAsc className="h-4 w-4 mr-2" />
            Sort by Name
          </Button>

          {/* Botón para cambiar vista (grid/lista, aún no implementado) */}
          <Button variant="outline" className="h-12 bg-transparent">
            <Grid className="h-4 w-4" />
          </Button>

          {/* Botón para agregar personaje */}
          <Button className="h-12">
            <Plus className="h-4 w-4 mr-2" />
            Add Character
          </Button>
        </div>
      </div>

      {/* ================= ADVANCED FILTERS ================= */}
      <Accordion
        type="single"
        collapsible
        value={activeAccordion}
        data-testid="accordion"
      >
        <AccordionItem value="advance-filters">
          <AccordionContent>
            <div className="bg-white rounded-lg p-6 mb-8 shadow-sm border">
              {/* Título */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Advanced Filters</h3>
                <Button variant="ghost">Clear All</Button>
              </div>

              {/* Filtros en grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* ========== TEAM FILTER ========== */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team</label>
                  <select
                    value={teamFilter.selectedValue}
                    onChange={(e) => teamFilter.handleChange(e.target.value)}
                    className="h-10 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">All teams</option>
                    {teamFilter.options.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ========== CATEGORY FILTER ========== */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={categoryFilter.selectedValue}
                    onChange={(e) =>
                      categoryFilter.handleChange(e.target.value)
                    }
                    className="h-10 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">All category</option>
                    {categoryFilter.options.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ========== UNIVERSE FILTER ========== */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Universe</label>
                  <select
                    value={universeFilter.selectedValue}
                    onChange={(e) =>
                      universeFilter.handleChange(e.target.value)
                    }
                    className="h-10 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">All universe</option>
                    {universeFilter.options.map((universe) => (
                      <option key={universe} value={universe}>
                        {universe}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ========== STATUS FILTER ========== */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={statuseFilter.selectedValue}
                    onChange={(e) => statuseFilter.handleChange(e.target.value)}
                    className="h-10 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="">All statuses</option>
                    {statuseFilter.options.map((statuse) => (
                      <option key={statuse} value={statuse}>
                        {statuse}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ========== STRENGTH SLIDER ========== */}
              <div className="mt-4">
                <label className="text-sm font-medium">
                  Minimum Strength: {selectedStrength}/10
                </label>

                <Slider
                  defaultValue={[selectedStrength]}
                  onValueChange={(value) =>
                    setQueryParams("strength", value[0].toString())
                  }
                  max={10}
                  step={1}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </>
  );
};
