import { useAuth } from "@clerk/react";
import { useEffect } from "react";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

export function useApiAuthSetup() {
  const { getToken } = useAuth();

  useEffect(() => {
    setBaseUrl(import.meta.env.VITE_API_BASE_URL || "");
    setAuthTokenGetter(async () => {
      const token = await getToken();
      return token;
    });

    return () => {
      setAuthTokenGetter(null);
    };
  }, [getToken]);
}
