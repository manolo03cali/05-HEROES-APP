// ================= IMPORTS =================

// Importo el hook experimental `use` de React
// Me permite leer directamente valores de un context sin usar useContext
import { use } from "react";

// Componentes de UI para construir el sistema de tabs
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Componentes visuales que componen la página
import { CustomJumbotron } from "@/components/custom/CustomJumbotron"; // Banner principal
import { HeroStats } from "@/heroes/components/HeroStats"; // Dashboard de estadísticas
import { HeroGrid } from "@/heroes/components/HeroGrid"; // Grid de tarjetas de personajes
import { CustomPagination } from "@/components/custom/CustomPagination"; // Paginación
import { CustomBreadcrums } from "@/components/custom/CustomBreadcrumbs"; // Breadcrumb

// Hooks personalizados para traer datos desde API o URL
import { useHeroSummary } from "@/heroes/hooks/useHeroSummary"; // Totales (héroes, villanos, etc.)
import { usePaginatedHero } from "@/heroes/hooks/usePaginatedHero"; // Lista paginada
import { useHeroSearchParams } from "@/heroes/hooks/useHeroSearchParams"; // Manejo de query params

// Contexto global donde guardo los favoritos
import { favoriteHeroContext } from "@/heroes/context/FavoriteHeroContext";

// ================= COMPONENTE =================

export const HomePage = () => {
  // 🔎 Obtengo los parámetros actuales de la URL
  // limit → cuantos elementos por página
  // page → página actual
  // selectedTab → tab activo
  // category → filtro de categoría
  // updateParams → función para cambiar los query params
  const { limit, page, selectedTab, updateParams, category } =
    useHeroSearchParams();

  // ⭐ Leo el contexto global de favoritos
  // favoriteCount → cantidad de favoritos
  // favorites → lista de personajes favoritos
  const { favoriteCount, favorites } = use(favoriteHeroContext);

  // Solo para debug
  console.log({ favorites });

  // 📡 Traigo la lista paginada de personajes según filtros actuales
  const { data: heroesResponse } = usePaginatedHero(
    +page, // convierto page a número
    +limit, // convierto limit a número
    category, // filtro de categoría
    selectedTab, // tab actual
  );

  // 📊 Traigo el resumen general (totales)
  const { data: summary } = useHeroSummary();

  // ================= RENDER =================
  return (
    <>
      <>
        {/* 🏆 Banner principal de la página */}
        <CustomJumbotron
          title="Universo de super heroes"
          description="Descubre, explora y administra el universo de super heroes"
        />

        {/* 🧭 Breadcrumb de navegación */}
        <CustomBreadcrums currentPage="Super Heroes" />

        {/* 📊 Muestro estadísticas solo cuando ya tengo datos */}
        {heroesResponse ? <HeroStats /> : null}

        {/* ================= TABS ================= */}

        <Tabs value={selectedTab} className="mb-8">
          {/* Lista de botones de tabs */}
          <TabsList className="grid w-full grid-cols-4">
            {/* TAB → TODOS LOS PERSONAJES */}
            <TabsTrigger
              value="all"
              onClick={() =>
                updateParams({
                  tab: "all",
                  category: "all",
                  page: "1", // reinicio paginación
                })
              }
            >
              All Characters ({summary?.totalHeroes})
            </TabsTrigger>

            {/* TAB → FAVORITOS */}
            <TabsTrigger
              value="favorites"
              onClick={() =>
                updateParams({
                  tab: "favorites",
                  category: "all",
                  page: "1",
                })
              }
              className="flex items-center gap-2"
            >
              Favorites ({favoriteCount})
            </TabsTrigger>

            {/* TAB → SOLO HEROES */}
            <TabsTrigger
              value="heroes"
              onClick={() =>
                updateParams({
                  tab: "heroes",
                  category: "Hero",
                  page: "1",
                })
              }
            >
              Heroes ({summary?.heroCount})
            </TabsTrigger>

            {/* TAB → SOLO VILLANOS */}
            <TabsTrigger
              value="villains"
              onClick={() =>
                updateParams({
                  tab: "villains",
                  category: "Villain",
                  page: "1",
                })
              }
            >
              Villains ({summary?.villainCount})
            </TabsTrigger>
          </TabsList>

          {/* ================= CONTENIDO DE CADA TAB ================= */}

          {/* 🧑‍🚀 TAB TODOS */}
          <TabsContent value="all">
            <h1>Todos los personajes</h1>

            {/* Paso la lista completa del backend */}
            <HeroGrid heroes={heroesResponse?.heroes ?? []} />
          </TabsContent>

          {/* ⭐ TAB FAVORITOS */}
          <TabsContent value="favorites">
            <h1>Personajes favoritos</h1>

            {/* Uso la lista del contexto global */}
            <HeroGrid heroes={favorites ?? []} />
          </TabsContent>

          {/* 🦸 TAB HEROES */}
          <TabsContent value="heroes">
            <h1>Heroes</h1>

            {/* Filtro solo los que tengan category Hero */}
            <HeroGrid
              heroes={
                heroesResponse?.heroes.filter(
                  (hero) => hero.category === "Hero",
                ) ?? []
              }
            />
          </TabsContent>

          {/* 🦹 TAB VILLANOS */}
          <TabsContent value="villains">
            <h1>Villains</h1>

            {/* Filtro solo los Villain */}
            <HeroGrid
              heroes={
                heroesResponse?.heroes.filter(
                  (hero) => hero.category === "Villain",
                ) ?? []
              }
            />
          </TabsContent>
        </Tabs>

        {/* ================= PAGINACIÓN ================= */}

        {/* No muestro paginación en favoritos porque no vienen del backend */}
        {selectedTab !== "favorites" && (
          <CustomPagination totalPages={heroesResponse?.pages ?? 1} />
        )}
      </>
    </>
  );
};
