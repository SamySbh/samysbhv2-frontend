<script setup lang="ts">
import { ref, computed } from 'vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

// Props
const props = defineProps<{
    orderId: string;
    paymentUrl: string;
    clientName: string;
    clientEmail: string;
    totalAmount: number;
    depositAmount: number;
}>();

// Emits
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'closeAndRefresh'): void;
}>();

// Refs
const linkInput = ref<HTMLInputElement | null>(null);
const linkCopied = ref(false);

// Computed
const finalAmount = computed(() => {
    return (props.totalAmount - props.depositAmount).toFixed(2);
});

// Formater le prix
function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Sélectionner le lien
function selectLink() {
    linkInput.value?.select();
}

// Copier le lien
async function copyLink() {
    try {
        await navigator.clipboard.writeText(props.paymentUrl);
        linkCopied.value = true;

        setTimeout(() => {
            linkCopied.value = false;
        }, 3000);

        selectLink();
    } catch (error) {
        selectLink();
        alert('Impossible de copier automatiquement. Le lien est sélectionné, faites Ctrl+C.');
    }
}

// Ouvrir le lien (test)
function openPaymentLink() {
    window.open(props.paymentUrl, '_blank', 'noopener,noreferrer');
}

// Envoyer email au client
function sendEmailToClient() {
    const subject = encodeURIComponent(`Votre devis - ${props.clientName}`);
    const body = encodeURIComponent(`Bonjour ${props.clientName},

Suite à notre échange, voici votre devis personnalisé.

Montant total : ${formatPrice(props.totalAmount)}
Acompte à régler (30%) : ${formatPrice(props.depositAmount)}

Pour lancer le projet, merci de régler l'acompte via ce lien sécurisé :
${props.paymentUrl}

Le projet démarrera dès réception de votre paiement.

À très vite,
Samy`);

    window.location.href = `mailto:${props.clientEmail}?subject=${subject}&body=${body}`;
}

// Fermer et rafraîchir
function closeAndRefresh() {
    emit('closeAndRefresh');
}

// Fermer la modal
function closeModal() {
    emit('close');
}
</script>

<template>
    <BaseModal title="" @close="closeModal">
        <!-- Header de succès personnalisé -->
        <div class="text-center mb-6 -mt-2">
            <div class="text-6xl mb-3 animate-bounce">&#x2705;</div>
            <h2 class="text-2xl font-bold text-success">Commande créée avec succès !</h2>
        </div>

        <!-- Récapitulatif commande -->
        <div class="bg-secondary-ghost rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-primary mb-3">📋 Récapitulatif de la commande</h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <span class="text-xs text-primary-ghost uppercase">N° de commande</span>
                    <p class="font-mono font-medium text-primary">#{{ orderId.slice(-8).toUpperCase() }}</p>
                </div>
                <div>
                    <span class="text-xs text-primary-ghost uppercase">Client</span>
                    <p class="font-medium text-primary">{{ clientName }}</p>
                </div>
                <div>
                    <span class="text-xs text-primary-ghost uppercase">Email</span>
                    <p class="text-primary">{{ clientEmail }}</p>
                </div>
                <div>
                    <span class="text-xs text-primary-ghost uppercase">Montant total</span>
                    <p class="font-semibold text-primary">{{ formatPrice(totalAmount) }}</p>
                </div>
            </div>

            <!-- Répartition des montants -->
            <div class="flex items-center gap-4 mt-4 pt-4 border-t border-primary-ghost/20">
                <div class="flex-1 text-center p-3 bg-secondary rounded-lg border-l-4 border-info">
                    <div class="text-xs text-primary-ghost uppercase mb-1">Acompte (30%)</div>
                    <div class="text-xl font-bold text-info">{{ formatPrice(depositAmount) }}</div>
                    <div class="text-xs text-primary-ghost">À payer maintenant</div>
                </div>
                <div class="text-xl text-primary-ghost font-bold">+</div>
                <div class="flex-1 text-center p-3 bg-secondary rounded-lg border-l-4 border-success">
                    <div class="text-xs text-primary-ghost uppercase mb-1">Solde (70%)</div>
                    <div class="text-xl font-bold text-success">{{ finalAmount }} €</div>
                    <div class="text-xs text-primary-ghost">À la livraison</div>
                </div>
            </div>
        </div>

        <!-- Lien de paiement -->
        <div class="mb-6">
            <h3 class="font-semibold text-primary mb-3">💳 Lien de paiement pour l'acompte</h3>

            <div class="p-4 bg-secondary-ghost rounded-lg border-2 border-dashed border-info">
                <div class="flex gap-2 mb-3">
                    <input
                        ref="linkInput"
                        :value="paymentUrl"
                        readonly
                        class="input-field-light flex-1 font-mono text-sm"
                        @focus="selectLink"
                    />
                    <BaseButton
                        :variant="linkCopied ? 'primary' : 'accent'"
                        @click="copyLink"
                    >
                        {{ linkCopied ? 'Copié !' : 'Copier' }}
                    </BaseButton>
                </div>
                <p class="text-sm text-center" :class="linkCopied ? 'text-success font-medium' : 'text-primary-ghost'">
                    {{ linkCopied ? 'Lien copié dans le presse-papier !' : 'Cliquez sur "Copier" pour copier le lien' }}
                </p>
            </div>
        </div>

        <!-- Instructions -->
        <div class="mb-6 bg-warning-light rounded-lg p-4 border border-warning">
            <h3 class="font-semibold text-primary mb-3">📤 Prochaines étapes</h3>

            <ol class="space-y-4">
                <li class="flex gap-3">
                    <span class="flex-shrink-0 w-7 h-7 bg-warning text-secondary rounded-full flex items-center justify-center font-bold text-sm">1</span>
                    <div>
                        <strong class="block text-primary">Envoyer le devis au client</strong>
                        <p class="text-sm text-primary-ghost">Préparez votre devis sur Shine ou votre outil habituel</p>
                    </div>
                </li>
                <li class="flex gap-3">
                    <span class="flex-shrink-0 w-7 h-7 bg-warning text-secondary rounded-full flex items-center justify-center font-bold text-sm">2</span>
                    <div>
                        <strong class="block text-primary">Inclure le lien de paiement</strong>
                        <p class="text-sm text-primary-ghost">Copiez le lien ci-dessus et collez-le dans votre email de devis</p>
                    </div>
                </li>
                <li class="flex gap-3">
                    <span class="flex-shrink-0 w-7 h-7 bg-warning text-secondary rounded-full flex items-center justify-center font-bold text-sm">3</span>
                    <div>
                        <strong class="block text-primary">Attendre le paiement</strong>
                        <p class="text-sm text-primary-ghost">Le client clique sur le lien et paie l'acompte via Stripe</p>
                    </div>
                </li>
                <li class="flex gap-3">
                    <span class="flex-shrink-0 w-7 h-7 bg-warning text-secondary rounded-full flex items-center justify-center font-bold text-sm">4</span>
                    <div>
                        <strong class="block text-primary">Démarrer le projet</strong>
                        <p class="text-sm text-primary-ghost">Dès réception du paiement, vous pouvez commencer le travail</p>
                    </div>
                </li>
            </ol>
        </div>

        <!-- Bouton email -->
        <div class="text-center mb-2">
            <BaseButton variant="primary" full-width @click="sendEmailToClient">
                📧 Envoyer par email au client
            </BaseButton>
            <p class="text-xs text-primary-ghost mt-2">Ouvre votre client mail avec un template pré-rempli</p>
        </div>

        <template #footer>
            <BaseButton variant="secondary" @click="openPaymentLink">
                Ouvrir le lien (test)
            </BaseButton>
            <BaseButton variant="accent" @click="closeAndRefresh">
                J'ai envoyé le lien
            </BaseButton>
        </template>
    </BaseModal>
</template>
