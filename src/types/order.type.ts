import { ServicePlan } from "./plan.type";

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED"
  | "FULFILLING"
  | "COMPLETED";

export type GiftRecipientType = "SELF" | "FRIEND" | "DONATION";

export type ShippingStatus =
  | "NOT_REQUIRED"
  | "PENDING"
  | "PREPARING"
  | "SHIPPING"
  | "DELIVERED"
  | "FAILED";

export interface Order {
  id: string;
  orderCode: string;
  planId: string;
  plan?: ServicePlan;
  status: OrderStatus;
  subtotalAmount: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;

  recipientType: GiftRecipientType;
  recipientName?: string;
  recipientPhone?: string;
  recipientAddress?: string;
  recipientNote?: string;

  giftMessage?: string;
  giftCardTheme?: string;
  potCustomOption?: string;
  packagingOption?: string;

  shippingStatus: ShippingStatus;
  createdAt: string;
  paidAt?: string;
}
