import { TestService } from "@/services";
import { useState } from "react";

const useTestApiCall = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const testFunction = async () => {
    setLoading(true);
    try {
      const response = await TestService.apiMethod.get({
        url: "/test-endpoint",
      });
      console.log("API Response:", response);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, testFunction };
};

export { useTestApiCall };
