import { useQuery } from "@tanstack/react-query";
import { searchHeroesActions } from "../actions/search-heroes.action";
import type { HeroSearchOptions } from "../types/HeroSearchOptionsInterface";
export const useHeroSearch = (options: HeroSearchOptions) => {
  return useQuery({
    queryKey: ["search-heroes", options],
    queryFn: () => searchHeroesActions(options),
    staleTime: 60 * 1000 * 5, // 5 minutos
  });
};
