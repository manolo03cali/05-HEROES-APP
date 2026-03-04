import { useMemo } from "react";
import { useSearchParams } from "react-router";

// Tipa VALID_TABS como una tupla inmutable
const VALID_TABS = ["all", "favorites", "heroes", "villains"] as const;

// Crea un tipo basado en la tupla
type TabType = (typeof VALID_TABS)[number];

export const useHeroSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Asegura que activeTab queda estrictamente como string, no string|null
  const activeTab = (searchParams.get("tab") ?? "all") as string;
  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "6";
  const category = searchParams.get("category") ?? "all";

  // selectedTab queda tipado como TabType, nunca null, nunca string genérico
  const selectedTab: TabType = useMemo(() => {
    return VALID_TABS.includes(activeTab as TabType)
      ? (activeTab as TabType)
      : "all";
  }, [activeTab]);

  // Helper para actualizar parámetros
  const updateParams = (updates: Record<string, string>) => {
    setSearchParams((prev) => {
      for (const [key, value] of Object.entries(updates)) {
        prev.set(key, value);
      }
      return prev;
    });
  };

  return {
    activeTab,
    selectedTab,
    page,
    limit,
    updateParams,
    searchParams,
    setSearchParams,
    category,
  };
};
