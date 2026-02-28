import type { Order } from '@/types/order';
import { authFetch } from '@/utils/http';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const orderApi = {
  // Récupérer une commande par ID avec tous les détails (client authentifié)
  async getById(id: string): Promise<Order> {
    const response = await authFetch(`${API_URL}/orders/${id}/details`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Commande non trouvée');
    }

    const result = await response.json();
    return result.data;
  },

  // Récupérer toutes les commandes de l'utilisateur connecté
  async getMyOrders(): Promise<Order[]> {
    const response = await authFetch(`${API_URL}/orders/my-orders`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors du chargement de vos commandes');
    }

    const result = await response.json();
    return result.data;
  },

  // Générer un lien de paiement (acompte ou solde)
  async getPaymentLink(orderId: string, paymentType: 'deposit' | 'final'): Promise<string> {
    const response = await authFetch(`${API_URL}/orders/${orderId}/payment-link`, {
      method: 'POST',
      body: JSON.stringify({ paymentType }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la génération du lien de paiement');
    }

    const result = await response.json();
    return result.data?.paymentUrl || result.paymentUrl;
  },
};
