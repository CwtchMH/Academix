import { CertificateService } from "@/services";

type CertificateResponse = {
  data: any[];
  message: string;
  success: boolean;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
};

export const useCertificate = () => {
  const {
    data: dataResponse = { data: [] },
    isLoading: loading,
    error,
    refetch: getCertificate,
  } = CertificateService.useGet<CertificateResponse>({
    url: "",
  });

  return {
    data: dataResponse?.data || [],
    loading,
    error,
    getCertificate,
  };
};
