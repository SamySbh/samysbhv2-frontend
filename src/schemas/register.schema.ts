import * as yup from 'yup'

export const registerSchema = yup.object({
    firstName: yup.string()
        .required('Le prénom est obligatoire')
        .min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: yup.string()
        .required('Le nom est obligatoire')
        .min(2, 'Le nom doit contenir au moins 2 caractères'),
    email: yup.string()
        .required('L\'email est obligatoire')
        .email('Format d\'email invalide'),
    phone: yup.string()
        .required('Le numéro de téléphone est obligatoire')
        .matches(/^\+?[0-9]{10,15}$/, 'Le numéro de téléphone doit contenir entre 10 et 15 chiffres'),
    company: yup.string()
        .optional(),
    password: yup.string()
        .required('Le mot de passe est obligatoire')
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .matches(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
        .matches(/[^A-Za-z0-9]/, 'Le mot de passe doit contenir au moins un caractère spécial')
})