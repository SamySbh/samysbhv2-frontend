<script setup lang="ts">
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { contactSchema } from '@/schemas'
import { ContactFormValues } from '@/types'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/ui/BaseAlert.vue'

const loading = ref<boolean>(false)
const successMessage = ref<string>('')
const errorMessage = ref<string>('')

const subjectOptions = [
    { value: 'Site Vitrine', label: 'Site Vitrine' },
    { value: 'Boutique E-commerce', label: 'Boutique E-commerce' },
    { value: 'Logiciel Web', label: 'Logiciel Web' },
    { value: 'Coaching Web', label: 'Coaching Web' },
    { value: 'Autre', label: 'Autre' },
]

// Utilisation du schéma importé
const validationSchema = toTypedSchema(contactSchema)

// Initialisation du formulaire avec vee-validate
const { handleSubmit, errors, resetForm } = useForm<ContactFormValues>({
    validationSchema,
    initialValues: {
        name: '',
        email: '',
        subject: '',
        message: ''
    }
})

// Création des champs avec vee-validate
const { value: name } = useField<string>('name')
const { value: email } = useField<string>('email')
const { value: subject } = useField<string>('subject')
const { value: message } = useField<string>('message')

// Fonction de soumission du formulaire
const onSubmit = handleSubmit(async (values) => {
    loading.value = true
    successMessage.value = ''
    errorMessage.value = ''

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de l\'envoi du message');
        }

        resetForm();
        successMessage.value = 'Message envoyé avec succès !';

    } catch (error: unknown) {
        console.error('Error submitting form:', error);

        if (error instanceof Error) {
            errorMessage.value = error.message;
        } else if (typeof error === 'string') {
            errorMessage.value = error;
        } else {
            errorMessage.value = 'Une erreur inconnue est survenue';
        }
    } finally {
        loading.value = false;
    }
})
</script>
<template>
    <div class="container max-w-md card m-4 space-y-4">

        <!-- Messages d'état -->
        <BaseAlert v-if="successMessage" variant="success" dismissible @dismiss="successMessage = ''">
            {{ successMessage }}
        </BaseAlert>
        <BaseAlert v-if="errorMessage" variant="error" dismissible @dismiss="errorMessage = ''">
            {{ errorMessage }}
        </BaseAlert>

        <!-- Formulaire de contact -->
        <form @submit="onSubmit" class="space-y-4">
            <!-- Champ nom -->
            <BaseInput
                v-model="name"
                label="Nom"
                placeholder="Votre nom"
                :error="errors.name"
            />

            <!-- Champ email -->
            <BaseInput
                v-model="email"
                type="email"
                label="Email"
                placeholder="votre@email.com"
                :error="errors.email"
            />

            <!-- Champ objet -->
            <BaseSelect
                v-model="subject"
                :options="subjectOptions"
                label="Objet"
                placeholder="Sélectionnez un objet"
                :error="errors.subject"
            />

            <!-- Champ message -->
            <div>
                <label for="message" class="input-label">Message</label>
                <textarea id="message" v-model="message" rows="4"
                    class="input-field" placeholder="Votre message"
                    :class="{ 'input-field-error': errors.message }"></textarea>
                <p v-if="errors.message" class="input-error-message">{{ errors.message }}</p>
            </div>

            <!-- Bouton d'envoi -->
            <div>
                <BaseButton type="submit" variant="primary" full-width :loading="loading">
                    <template #loading>Envoi en cours...</template>
                    Envoyer le message
                </BaseButton>
            </div>
        </form>
    </div>
</template>
