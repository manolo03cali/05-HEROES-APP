import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";

type FilterAction = () => Promise<string[]>;

export const useFilter = (paramName: string, fetchAction: FilterAction) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar las opciones desde el backend
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const data = await fetchAction();
        setOptions(data);
      } catch (error) {
        console.error(`Failed to load ${paramName}`, error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };
    loadOptions();
  }, [fetchAction]);

  // Valor actual del filtro (de la URL)
  const selectedValue = searchParams.get(paramName) ?? "";

  // Actualizar el filtro en la URL
  const handleChange = (value: string) => {
    setSearchParams((prev) => {
      if (!value) {
        prev.delete(paramName);
      } else {
        prev.set(paramName, value);
      }
      return prev;
    });
  };

  return {
    options,
    selectedValue,
    handleChange,
    loading,
  };
};
