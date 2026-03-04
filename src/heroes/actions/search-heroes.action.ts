import { heroApi } from "../api/hero.api";
import type { Hero } from "../types/hero.interface";
import type { HeroSearchOptions } from "../types/HeroSearchOptionsInterface";
const VITE_API_URL = import.meta.env.VITE_API_URL;
export const searchHeroesActions = async (options: HeroSearchOptions = {}) => {
  const { name, team, category, universe, status, strength, sort } = options;

  if (!name && !team && !category && !universe && !status && !strength) {
    return [];
  }
  const { data } = await heroApi.get<Hero[]>(`/search`, {
    params: {
      name,
      team,
      category,
      universe,
      status,
      strength,
      sort,
    },
  });

  return data.map((hero) => ({
    ...hero,
    image: `${VITE_API_URL}/images/${hero.image}`,
  }));
};
