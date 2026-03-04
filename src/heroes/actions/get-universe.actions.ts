import { heroApi } from "../api/hero.api";

export const getUniversesAction = async () => {
  const { data } = await heroApi.get<string[]>("/universes");
  return data;
};
