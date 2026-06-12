import axiosClient from "./axiosClient";
import { ServicePlan, UserEntitlements } from "../types/plan.type";

interface ApiResponse<T> {
  message: string;
  metadata: T;
}

export const planApi = {
  getPlans: async (): Promise<ServicePlan[]> => {
    const res = await axiosClient.get<ApiResponse<ServicePlan[]>>("/plans");
    return res.data.metadata;
  },

  getMyCurrentPlan: async (): Promise<{ plan: ServicePlan; subscriptionEndsAt: string | null }> => {
    const res = await axiosClient.get<ApiResponse<{ plan: ServicePlan; subscriptionEndsAt: string | null }>>("/plans/my-current");
    return res.data.metadata;
  },

  getMyEntitlements: async (): Promise<UserEntitlements> => {
    const res = await axiosClient.get<ApiResponse<UserEntitlements>>("/me/entitlements");
    return res.data.metadata;
  },
};
