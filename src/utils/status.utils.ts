import { Order } from '../types/order';

// Types pour les statuts
export type OrderMainStatus = 'NEW' | 'VALIDATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type OrderPaymentStatus = 'PENDING_DEPOSIT' | 'DEPOSIT_PAID' | 'PENDING_FINAL' | 'FULLY_PAID';

// Libellés pour les statuts principaux
export const mainStatusLabels: Record<OrderMainStatus, string> = {
    'NEW': 'Nouveau',
    'VALIDATED': 'Validé',
    'IN_PROGRESS': 'En cours',
    'COMPLETED': 'Terminé',
    'ARCHIVED': 'Archivé'
};

// Libellés pour les statuts de paiement
export const paymentStatusLabels: Record<OrderPaymentStatus, string> = {
    'PENDING_DEPOSIT': 'En attente d\'acompte',
    'DEPOSIT_PAID': 'Acompte payé',
    'PENDING_FINAL': 'En attente de paiement final',
    'FULLY_PAID': 'Entièrement payé'
};

// Obtenir le libellé d'un statut principal
export const getMainStatusLabel = (status: OrderMainStatus): string => {
    return mainStatusLabels[status] || status;
};

// Obtenir le libellé d'un statut de paiement
export const getPaymentStatusLabel = (status: OrderPaymentStatus): string => {
    return paymentStatusLabels[status] || status;
};

// Classes CSS pour le statut principal
export const getMainStatusClasses = (status: OrderMainStatus) => {
    return [
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
            'bg-cyan-100 text-cyan-800': status === 'NEW',
            'bg-green-100 text-green-800': status === 'VALIDATED',
            'bg-yellow-100 text-yellow-800': status === 'IN_PROGRESS',
            'bg-blue-100 text-blue-800': status === 'COMPLETED',
            'bg-gray-100 text-gray-800': status === 'ARCHIVED'
        }
    ];
};

// Classes CSS pour le statut de paiement
export const getPaymentStatusClasses = (status: OrderPaymentStatus) => {
    return [
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        {
            'bg-red-100 text-red-800': status === 'PENDING_DEPOSIT',
            'bg-orange-100 text-orange-800': status === 'DEPOSIT_PAID',
            'bg-amber-100 text-amber-800': status === 'PENDING_FINAL',
            'bg-emerald-100 text-emerald-800': status === 'FULLY_PAID'
        }
    ];
};

// Formatter la date avec gestion des undefined
export const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'Date inconnue';
    return new Date(date).toLocaleDateString('fr-FR');
};

// Méthode sécurisée pour récupérer la référence de commande
export const getOrderReference = (order: Order): string => {
    return order.id ? `#${order.id.slice(-6)}` : 'N/A';
};