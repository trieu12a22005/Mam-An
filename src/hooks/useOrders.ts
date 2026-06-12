import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderApi, CreateOrderInput } from "../api/order.api";
import { useAuth } from "./useAuth";

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) => orderApi.createOrder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-current-plan"] });
      queryClient.invalidateQueries({ queryKey: ["my-entitlements"] });
    },
  });
};

export const useSubscribeVirtualPlus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => orderApi.subscribeVirtualPlus(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      queryClient.invalidateQueries({ queryKey: ["my-current-plan"] });
      queryClient.invalidateQueries({ queryKey: ["my-entitlements"] });
    },
  });
};

export const useMyOrders = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["my-orders"],
    queryFn: orderApi.getMyOrders,
    enabled: isAuthenticated,
  });
};

export const useOrderDetail = (id: string) => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["order-detail", id],
    queryFn: () => orderApi.getOrderDetail(id),
    enabled: isAuthenticated && !!id,
  });
};
