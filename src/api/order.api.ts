import axiosClient from "./axiosClient";
import { Order } from "../types/order.type";
import { PlanCode, GiftRecipientType } from "../types/plan.type";

interface ApiResponse<T> {
  message: string;
  metadata: T;
}

export interface CreateOrderInput {
  planCode: PlanCode;
  recipientType: GiftRecipientType;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  recipientNote?: string;
  giftMessage?: string;
  giftCardTheme?: string;
  potCustomOption?: string;
  packagingOption?: string;
}

export interface UpdateShippingInfoInput {
  recipientType?: GiftRecipientType;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  recipientNote?: string;
}

export const orderApi = {
  createOrder: async (input: CreateOrderInput): Promise<Order> => {
    const res = await axiosClient.post<ApiResponse<Order>>("/orders", input);
    return res.data.metadata;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const res = await axiosClient.get<ApiResponse<Order[]>>("/orders/my");
    return res.data.metadata;
  },

  getOrderDetail: async (id: string): Promise<Order> => {
    const res = await axiosClient.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.metadata;
  },

  subscribeVirtualPlus: async (): Promise<Order> => {
    const res = await axiosClient.post<ApiResponse<Order>>("/subscriptions/virtual-plus", {
      paymentMethod: "MANUAL_BANK_TRANSFER",
    });
    return res.data.metadata;
  },

  updateShippingInfo: async (id: string, input: UpdateShippingInfoInput): Promise<Order> => {
    const res = await axiosClient.patch<ApiResponse<Order>>(`/orders/${id}/shipping-info`, input);
    return res.data.metadata;
  },
};
