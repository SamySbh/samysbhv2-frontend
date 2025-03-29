import * as yup from 'yup'


export const contactSchema = yup.object({
    name: yup.string().required('Le nom est obligatoire'),
    email: yup.string().required('L\'email est obligatoire').email('Format d\'email invalide'),
    subject: yup.string().required('Veuillez sélectionner un objet'),
    message: yup.string()
        .required('Le message est obligatoire')
        .min(10, 'Le message doit contenir au moins 10 caractères')
})