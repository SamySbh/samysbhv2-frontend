import { Service } from "./service";

export interface CartItem {
    serviceId: string;
    service: Service;
    quantity: number;
    unitAmount: number;
    totalAmount: number;
}

export interface CartOrderData {
    statusMain: "NEW" | "VALIDATED" | "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
    statusPayment: "PENDING_DEPOSIT" | "DEPOSIT_PAID" | "PENDING_FINAL" | "FULLY_PAID";
    totalAmount: number;
    depositAmount: number;
    userId: string;
    orderItems: {
        serviceId: string;
        quantity: number;
        unitAmount: number;
        totalAmount: number;
    }[];
}