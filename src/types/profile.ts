export interface ProfileErrors {
    firstName?: string;
    lastName?: string;
    phone?: string;
}

export interface PasswordErrors {
    currentPassword?: string;
    newPassword?: string;
    confirmNewPassword?: string;
}

export interface ValidationErrorsType {
    profile: ProfileErrors;
    password: PasswordErrors;
}