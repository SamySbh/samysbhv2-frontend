import { OrderItem } from "./order-item";


// Types de service disponibles (constante)
export const serviceTypes = ['VITRINE', 'ECOMMERCE', 'SAAS', 'COACHING'] as const;

// Type union pour le type de service
export type ServiceType = typeof serviceTypes[number];

// Interface de base pour les services (champs communs)
export interface BaseService {
    name: string;
    description: string;
    basePrice: number;
    image: string;
    type: ServiceType;
    isActive: boolean;
    features: string[];
}

// Interface complète du Service (avec tous les champs possibles)
export interface Service extends BaseService {
    id?: string;
    stripeProductId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    orderItems?: OrderItem[];
}

// Interface pour les formulaires de service (création/édition)
// Réutilise l'interface de base
export type ServiceFormData = BaseService;

// Valeurs par défaut pour initialiser un formulaire de service
export const defaultServiceFormData: ServiceFormData = {
    name: '',
    description: '',
    basePrice: 0,
    image: '',
    isActive: true,
    type: 'VITRINE',
    features: []
};