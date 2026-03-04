import { beforeEach, describe, expect, test } from "vitest";
import { getHeroesByPageAction } from "./get-heroes-by-page.actions";
import AxiosMockAdapter from "axios-mock-adapter";
import { heroApi } from "../api/hero.api";

const BASE_URL = import.meta.env.VITE_API_URL;

describe("get-heroes-by-page.actions", () => {
  const heroesApiMock = new AxiosMockAdapter(heroApi);
  beforeEach(() => {
    heroesApiMock.reset();
  });
  test("should return default heroes", async () => {
    heroesApiMock.onGet("/").reply(200, {
      total: 10,
      page: 1,
      limit: 6,
      heroes: [
        {
          id: "1",
          name: "Superman",
          image: "superman.jpg",
        },
        {
          id: "2",
          name: "Batman",
          image: "batman.jpg",
        },
      ],
    });

    const response = await getHeroesByPageAction(1);
    expect(response).toStrictEqual({
      total: 10,
      page: 1,
      limit: 6,
      heroes: [
        {
          id: "1",
          name: "Superman",
          image: `${BASE_URL}/images/superman.jpg`,
        },
        {
          id: "2",
          name: "Batman",
          image: `${BASE_URL}/images/batman.jpg`,
        },
      ],
    });
  });
  test("should return the correct heroes when page is not a number", async () => {
    const responseObjet = {
      total: 10,
      page: 1,
      heroes: [],
    };
    heroesApiMock.onGet("/").reply(200, responseObjet);
    heroesApiMock.resetHistory();

    await getHeroesByPageAction("abc" as unknown as number);

    const params = heroesApiMock.history.get[0].params;
    expect(params).toStrictEqual({
      limit: 6,
      offset: 0,
      category: "all",
    });
  });
  test("should return the correct heroes when page is string  number", async () => {
    const responseObjet = {
      total: 10,
      page: 1,
      heroes: [],
    };
    heroesApiMock.onGet("/").reply(200, responseObjet);
    heroesApiMock.resetHistory();

    await getHeroesByPageAction("5" as unknown as number);

    const params = heroesApiMock.history.get[0].params;
    expect(params).toStrictEqual({
      limit: 6,
      offset: 24,
      category: "all",
    });
  });
  test("should call the api with correct params", async () => {
    const responseObjet = {
      total: 10,
      page: 1,
      heroes: [],
    };
    heroesApiMock.onGet("/").reply(200, responseObjet);
    heroesApiMock.resetHistory();

    await getHeroesByPageAction(2, 10, "heroes");

    const params = heroesApiMock.history.get[0].params;
    expect(params).toStrictEqual({
      limit: 10,
      offset: 10,
      category: "heroes",
    });
  });
});
