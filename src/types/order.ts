import { OrderItem } from "./order-item";
import { User } from "./user";
import { ProjectRequest } from "./projectRequest";

export interface Order {
    id?: string;
    statusMain: OrderStatus;
    statusPayment: PaymentStatus;
    totalAmount: number;
    depositAmount: number;
    deadlineDate?: Date;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    depositPaidAt?: Date;
    depositStripeSessionId?: string;
    finalPaidAt?: Date;
    finalStripeSessionId?: string;
    paymentError?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId: string;
    user?: User;
    orderItems?: OrderItem[];
    projectRequests?: ProjectRequest[];
}

export type OrderStatus = 'NEW' | 'VALIDATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type PaymentStatus = 'PENDING_DEPOSIT' | 'DEPOSIT_PAID' | 'PENDING_FINAL' | 'FULLY_PAID';

export interface CreateOrderDto {
    projectRequestId: string;
    totalAmount: number;
    depositAmount: number;
    dueDate: string;
    internalNotes?: string;
}