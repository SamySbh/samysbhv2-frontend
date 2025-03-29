export interface CheckoutSessionRequest {
    orderId: string;
}

export interface CheckoutSessionResponse {
    sessionUrl: string;
}