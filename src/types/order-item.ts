import { Order } from "./order";
import { Service } from "./service";

export interface OrderItem {
    id?: string;
    unitAmount: number;
    totalAmount: number;
    quantity: number;
    createdAt?: Date;
    updatedAt?: Date;
    orderId: string;
    order?: Order;
    serviceId: string;
    service?: Service;
}

// Type pour la création d'OrderItem sans les champs générés par le serveur
export interface OrderItemInput {
    unitAmount: number;
    totalAmount: number;
    quantity: number;
    serviceId: string;
}