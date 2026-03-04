import { heroApi } from "../api/hero.api";

export const getStatusesAction = async () => {
  const { data } = await heroApi.get<string[]>("/statuses");
  return data;
};
