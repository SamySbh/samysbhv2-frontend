import { OrderItem } from "./order-item";
import { User } from "./user";

export interface Order {
    id?: string;
    statusMain: "NEW" | "VALIDATED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
    statusPayment: "PENDING_DEPOSIT" | "DEPOSIT_PAID" | "PENDING_FINAL" | "FULLY_PAID";
    totalAmount: number;
    depositAmount: number;
    deadlineDate?: Date;
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
    paymentError?: string;
    createdAt?: Date;
    updatedAt?: Date;
    userId: string;
    user?: User;
    orderItems?: OrderItem[];
}