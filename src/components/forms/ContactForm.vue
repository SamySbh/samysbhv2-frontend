<script setup lang="ts">
import { ref } from 'vue'
import { useForm, useField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { contactSchema } from '@/schemas'
import { ContactFormValues } from '@/types'

const loading = ref<boolean>(false)

const subjects = [
    'Site Vitrine',
    'Boutique E-commerce',
    'Logiciel Web',
    'Coaching Web',
    'Autre'
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

        alert('Message envoyé avec succès!');
        
    } catch (error: unknown) {
        console.error('Error submitting form:', error);
        
        let errorMessage = 'Une erreur inconnue est survenue';
        
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        
        alert('Erreur: ' + errorMessage);
    } finally {
        loading.value = false;
    }
})
</script>
<template>
    <div class="container max-w-md card m-4 space-y-4">

        <!-- Formulaire de contact -->
        <form @submit="onSubmit" class="space-y-4">
            <!-- Champ nom -->
            <div>
                <label for="name" class="block text-sm font-medium text-accent">Nom</label>
                <input type="text" id="name" v-model="name"
                    class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded" placeholder="Votre nom"
                    :class="{ 'border-red-500': errors.name }">
                <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
            </div>

            <!-- Champ email -->
            <div>
                <label for="email" class="block text-sm font-medium text-accent">Email</label>
                <input type="email" id="email" v-model="email"
                    class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded" placeholder="votre@email.com"
                    :class="{ 'border-red-500': errors.email }">
                <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
            </div>

            <!-- Champ object -->
            <div>
                <label for="object" class="block text-sm font-medium text-accent">Objet</label>
                <select id="object" v-model="subject"
                    class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                    :class="{ 'border-red-500': errors.subject }">
                    <option value="">Sélectionnez un objet</option>
                    <option v-for="subject in subjects" :key="subject" :value="subject">
                        {{ subject }}
                    </option>
                </select>
                <p v-if="errors.subject" class="mt-1 text-sm text-red-600">{{ errors.subject }}</p>
            </div>

            <!-- Champ message -->
            <div>
                <label for="message" class="block text-sm font-medium text-accent">Message</label>
                <textarea id="message" v-model="message" rows="4"
                    class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded" placeholder="Votre message"
                    :class="{ 'border-red-500': errors.message }"></textarea>
                <p v-if="errors.message" class="mt-1 text-sm text-red-600">{{ errors.message }}</p>
            </div>

            <!-- Bouton d'envoi -->
            <div>
                <button type="submit" class="w-full btn-primary" :disabled="loading">
                    <span v-if="loading">Envoi en cours...</span>
                    <span v-else>Envoyer le message</span>
                </button>
            </div>
        </form>
    </div>
</template>