import { authFetch } from '@/utils/http';
import type { Order } from '@/types/order';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const orderAdminApi = {
  // Lister toutes les commandes (admin)
  async getAll(filters?: {
    status?: string;
    paymentStatus?: string;
  }): Promise<Order[]> {
    const url = new URL(`${API_URL}/admin/orders`);

    if (filters?.status) {
      url.searchParams.append('status', filters.status);
    }
    if (filters?.paymentStatus) {
      url.searchParams.append('paymentStatus', filters.paymentStatus);
    }

    const response = await authFetch(url.toString());

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des commandes');
    }

    const result = await response.json();
    return result.data;
  },

  // Mettre à jour le statut d'une commande (admin)
  async updateStatus(orderId: string, status: string): Promise<Order> {
    const response = await authFetch(`${API_URL}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour du statut');
    }

    const result = await response.json();
    return result.data;
  },

  // Générer le lien de paiement pour le solde (admin)
  async generateFinalPaymentLink(orderId: string): Promise<string> {
    const response = await authFetch(`${API_URL}/orders/${orderId}/payment-link`, {
      method: 'POST',
      body: JSON.stringify({ paymentType: 'final' }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la génération du lien de paiement');
    }

    const result = await response.json();
    return result.data?.paymentUrl || result.paymentUrl;
  },
};
