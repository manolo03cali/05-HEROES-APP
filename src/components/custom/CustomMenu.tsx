import {
  NavigationMenuItem,
  NavigationMenuLink,
} from "@radix-ui/react-navigation-menu";
import { Link, useLocation } from "react-router";
import { NavigationMenu, NavigationMenuList } from "../ui/navigation-menu";
import { cn } from "@/lib/utils";

export const CustomMenu = () => {
  const { pathname } = useLocation();

  const isActive = (path: string) => {
    return pathname === path;
  };

  // 🔹 Arreglo de opciones del menú
  const menuItems = [
    { label: "Inicio", path: "/" },
    { label: "Buscar super héroes", path: "/search" },
  ];

  return (
    <NavigationMenu className="py-5">
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.path}>
            <NavigationMenuLink
              asChild
              className={cn(
                "px-4 py-2 rounded-md text-lg font-semibold transition-colors",
                isActive(item.path)
                  ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
                  : "hover:bg-slate-100 text-slate-600"
              )}
            >
              <Link to={item.path}>{item.label}</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
