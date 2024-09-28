import { useState } from "react";

export const useLoading = () => {
  const [isLoading, setIsloading] = useState(false);
  return {
    isLoading,
    setIsloading,
  };
};
