import { useQuery } from "@tanstack/react-query";
import { planApi } from "../api/plan.api";
import { useAuth } from "./useAuth";

export const usePlans = () => {
  return useQuery({
    queryKey: ["plans"],
    queryFn: planApi.getPlans,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyCurrentPlan = () => {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ["my-current-plan"],
    queryFn: planApi.getMyCurrentPlan,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
};

export const useMyEntitlements = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["my-entitlements"],
    queryFn: planApi.getMyEntitlements,
    enabled: isAuthenticated,
    staleTime: 60 * 1000,
  });
};
