import { Order } from '../types/order';

// Types pour les statuts
export type OrderMainStatus = 'NEW' | 'VALIDATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
export type OrderPaymentStatus = 'PENDING_DEPOSIT' | 'DEPOSIT_PAID' | 'PENDING_FINAL' | 'FULLY_PAID';
export type BadgeVariant = 'info' | 'emphasis' | 'warning' | 'success' | 'error';

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

// Obtenir la variante de badge pour le statut principal
export const getMainStatusVariant = (status: OrderMainStatus): BadgeVariant => {
    const variants: Record<OrderMainStatus, BadgeVariant> = {
        'NEW': 'info',
        'VALIDATED': 'emphasis',
        'IN_PROGRESS': 'warning',
        'COMPLETED': 'success',
        'ARCHIVED': 'info'
    };
    return variants[status] || 'info';
};

// Obtenir la variante de badge pour le statut de paiement
export const getPaymentStatusVariant = (status: OrderPaymentStatus): BadgeVariant => {
    const variants: Record<OrderPaymentStatus, BadgeVariant> = {
        'PENDING_DEPOSIT': 'error',
        'DEPOSIT_PAID': 'warning',
        'PENDING_FINAL': 'info',
        'FULLY_PAID': 'success'
    };
    return variants[status] || 'info';
};

// Classes CSS pour le statut principal (conservé pour compatibilité)
export const getMainStatusClasses = (status: OrderMainStatus) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variantClasses: Record<OrderMainStatus, string> = {
        'NEW': 'bg-info-light text-info',
        'VALIDATED': 'bg-emphasis/20 text-emphasis',
        'IN_PROGRESS': 'bg-warning-light text-warning',
        'COMPLETED': 'bg-success-light text-success',
        'ARCHIVED': 'bg-info-light text-info'
    };
    return `${baseClasses} ${variantClasses[status] || variantClasses['NEW']}`;
};

// Classes CSS pour le statut de paiement (conservé pour compatibilité)
export const getPaymentStatusClasses = (status: OrderPaymentStatus) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variantClasses: Record<OrderPaymentStatus, string> = {
        'PENDING_DEPOSIT': 'bg-error-light text-error',
        'DEPOSIT_PAID': 'bg-warning-light text-warning',
        'PENDING_FINAL': 'bg-info-light text-info',
        'FULLY_PAID': 'bg-success-light text-success'
    };
    return `${baseClasses} ${variantClasses[status] || variantClasses['PENDING_DEPOSIT']}`;
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
