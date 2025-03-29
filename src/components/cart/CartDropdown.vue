  <script setup lang="ts">
  import { useCartStore } from '@/stores';
  import { XCircleIcon } from '@heroicons/vue/24/solid'
  import ValidateCartButton from '@/components/cart/ValidateCartButton.vue';

  const cartStore = useCartStore();

  const incrementQuantity = (serviceId: string) => {
    const item = cartStore.cartItems.find(item => item.serviceId === serviceId);
    if (item) {
      cartStore.updateQuantity(serviceId, item.quantity + 1);
    }
  };

  const decrementQuantity = (serviceId: string) => {
    const item = cartStore.cartItems.find(item => item.serviceId === serviceId);
    if (item && item.quantity > 1) {
      cartStore.updateQuantity(serviceId, item.quantity - 1);
    }
  };

  const removeItem = (serviceId: string) => {
    cartStore.removeFromCart(serviceId);
  };

</script>
  <template>
    <div class="cart-dropdown bg-secondary shadow-lg rounded p-4 w-80 max-h-96 overflow-auto border border-accent">
      <div v-if="cartStore.itemCount === 0" class="text-center py-8 text-accent">
        Votre panier est vide
      </div>

      <div v-else>
        <h3 class="font-semibold text-lg mb-3">Votre panier</h3>

        <!-- Liste des articles -->
        <div class="space-y-3 mb-4 max-h-64 overflow-y-auto">
          <div v-for="item in cartStore.cartItems" :key="item.serviceId" class="flex items-start justify-between pb-2">
            <!-- Détails du service -->
            <div class="flex-grow pr-2">
              <p class="font-medium">{{ item.service.name }}</p>
              <p class="text-sm text-accent">{{ item.unitAmount.toFixed(2) }} €</p>
            </div>

            <!-- Choix des quantitées -->
            <div class="flex items-center space-x-2">
              <div class="flex items-center border-primary-ghost border rounded">
                <button @click="decrementQuantity(item.serviceId)"
                  class="px-2 py-1 text-primary-ghost hover:text-accent" :disabled="item.quantity <= 1">
                  -
                </button>
                <span class="px-2 py-1 text-sm">{{ item.quantity }}</span>
                <button @click="incrementQuantity(item.serviceId)"
                  class="px-2 py-1 text-primary-ghost hover:text-accent">
                  +
                </button>
              </div>

              <!-- Bouton supprimer -->
              <button @click="removeItem(item.serviceId)" class="text-red-500">
                <XCircleIcon class="size-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Résumé et total -->
        <div class="mt-4 pt-3 border-t border-primary-ghost">
          <div class="flex justify-between mb-4">
            <span class="font-medium">Total:</span>
            <span class="font-semibold">{{ cartStore.cartTotal.toFixed(2) }} €</span>
          </div>

          <div class="flex justify-center">
            <ValidateCartButton buttonText="Valider ma commande" />
          </div>
        </div>
      </div>
    </div>
  </template>

