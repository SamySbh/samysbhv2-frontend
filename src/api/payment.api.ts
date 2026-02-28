import { getAuthHeaders } from '@/utils/http';

const apiUrl = import.meta.env.VITE_API_URL;

export const paymentApi = {
  /**
   * Créer une session de paiement pour l'acompte (30%)
   */
  async createDepositSession(orderId: string) {
    try {
      const response = await fetch(`${apiUrl}/payment/orders/${orderId}/deposit-payment`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || 'Erreur création lien acompte');
      }

      return data.data; // { sessionId, url }
    } catch (error) {
      console.error('Erreur création session acompte:', error);
      throw error;
    }
  },

  /**
   * Créer une session de paiement pour le solde (70%)
   */
  async createFinalSession(orderId: string) {
    try {
      const response = await fetch(`${apiUrl}/payment/orders/${orderId}/final-payment`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || 'Erreur création lien solde');
      }

      return data.data; // { sessionId, url }
    } catch (error) {
      console.error('Erreur création session solde:', error);
      throw error;
    }
  },

  /**
   * Créer une session de paiement complète (ancien système)
   */
  async createCheckoutSession(orderId: string) {
    try {
      const response = await fetch(`${apiUrl}/payment/create-checkout-session`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.message || 'Erreur création session paiement');
      }

      return data.url;
    } catch (error) {
      console.error('Erreur création checkout session:', error);
      throw error;
    }
  }
};

export default paymentApi;
