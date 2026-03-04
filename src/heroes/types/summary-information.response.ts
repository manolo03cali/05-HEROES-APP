import type { Hero } from "./hero.interface";

export interface SummaryInformationResponse {
  totalHeroes: number;
  strongestHero: Hero;
  smartestHero: Hero;
  heroCount: number;
  villainCount: number;
  favoriteCount: number;
}
