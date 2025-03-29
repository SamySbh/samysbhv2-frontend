import { User } from "./user";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
    phone: string;
    company?: string;
}

export interface AuthResponse {
    success: boolean;
    data?: {
        user: User;
        accessToken?: string;
    };
    message: string;
}

export interface ProfileUpdateData {
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
    currentPassword?: string;
    newPassword?: string;
}
