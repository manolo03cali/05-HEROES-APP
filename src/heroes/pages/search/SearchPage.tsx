import { CustomJumbotron } from "@/components/custom/CustomJumbotron";
import { HeroStats } from "@/heroes/components/HeroStats";
import { SearchControls } from "./ui/SearchControls";
import { CustomBreadcrums } from "@/components/custom/CustomBreadcrumbs";
import { HeroGrid } from "@/heroes/components/HeroGrid";
import { searchHeroesActions } from "@/heroes/actions/search-heroes.action";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const filters = {
    name: searchParams.get("name") ?? "",
    team: searchParams.get("team") ?? "",
    category: searchParams.get("category") ?? "",
    universe: searchParams.get("universe") ?? "",
    status: searchParams.get("status") ?? "",
    strength: searchParams.get("strength") ?? "",
    sort: searchParams.get("sort") ?? "name-asc",
  };

  const { data: heroes = [] } = useQuery({
    queryKey: ["search", filters],
    queryFn: () => searchHeroesActions(filters),
    staleTime: 60 * 1000 * 5, // 5 minutos
  });

  return (
    <>
      <CustomJumbotron
        title="Busqueda de superHéroes"
        description="Descubre, explora y administra el universo de super heroes"
      />
      <CustomBreadcrums
        currentPage="Busqueda"
        // breadcrumbs={[
        //   { label: "Home1", to: "/" },
        //   { label: "Home2", to: "/" },
        //   { label: "Home3", to: "/" },
        // ]}
      />
      {/*Stats Dashboard */}
      <HeroStats />
      {/*Filter and search */}
      <SearchControls />
      {/* Hero Grid */}
      <HeroGrid heroes={heroes} />
    </>
  );
};
//export default SearchPage;
