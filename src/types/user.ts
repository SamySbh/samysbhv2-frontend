export interface User {
    id?: string;
    email: string;
    role: "ADMIN" | "USER" | "DISABLED";
    firstName: string;
    lastName: string;
    password?: string; // Optional car on ne le renvoie pas aux clients
    phone: string;
    company?: string;
    stripeCustomerId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export function getDefaultUser(): User {
    return {
        id: '',
        email: '',
        role: 'USER' as const,
        firstName: '',
        lastName: '',
        phone: '',

    };
}