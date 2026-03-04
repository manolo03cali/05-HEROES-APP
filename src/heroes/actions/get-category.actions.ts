import { heroApi } from "../api/hero.api";

export const getCategoriesAction = async () => {
  const { data } = await heroApi.get<string[]>("/categories");
  return data;
};
