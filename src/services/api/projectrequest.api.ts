import type { ProjectRequest, CreateProjectRequestDto } from '@/types/projectRequest';
import { authFetch } from '@/utils/http';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const projectRequestApi = {
  // ========================================
  // ROUTES PUBLIQUES (pas d'authentification)
  // ========================================

  // Créer une demande de projet (n'importe qui peut faire une demande)
  // Si connecté, le token est envoyé pour créer automatiquement la commande associée
  async create(data: CreateProjectRequestDto): Promise<ProjectRequest> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/project-requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la création de la demande');
    }

    const result = await response.json();
    return result.data.projectRequest ?? result.data;
  },

  // Récupérer une demande par ID (le client peut voir sa demande)
  async getById(id: string): Promise<ProjectRequest> {
    const response = await fetch(`${API_URL}/project-requests/${id}`);

    if (!response.ok) {
      throw new Error('Demande non trouvée');
    }

    const result = await response.json();
    return result.data;
  },

  // ========================================
  // ROUTES ADMIN (authentification requise)
  // ========================================

  // Lister toutes les demandes (admin uniquement)
  async getAll(status?: string): Promise<ProjectRequest[]> {
    const url = new URL(`${API_URL}/admin/project-requests`);
    if (status) {
      url.searchParams.append('status', status);
    }

    // Utilise authFetch pour envoyer le token JWT
    const response = await authFetch(url.toString());

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des demandes');
    }

    const result = await response.json();
    return result.data;
  },

  // Mettre à jour le statut (admin uniquement)
  async updateStatus(id: string, status: string): Promise<ProjectRequest> {
    // Utilise authFetch pour envoyer le token JWT
    const response = await authFetch(`${API_URL}/admin/project-requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la mise à jour');
    }

    const result = await response.json();
    return result.data;
  },
};
