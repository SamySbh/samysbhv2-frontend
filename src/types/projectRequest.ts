export interface ProjectRequest {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  requestedServices: RequestedService[];
  estimatedTotal: number;
  projectDescription: string;
  desiredDeadline: string;
  hasExistingSite: boolean;
  existingSiteUrl?: string;
  additionalInfo?: string;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'ARCHIVED';
  orderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestedService {
  serviceId: string;
  serviceName: string;
  quantity: number;
  price: number;
}

export interface CreateProjectRequestDto {
  email: string;
  name: string;
  phone?: string;
  company?: string;
  requestedServices: RequestedService[];
  estimatedTotal: number;
  projectDescription: string;
  desiredDeadline: string;
  hasExistingSite: boolean;
  existingSiteUrl?: string;
  additionalInfo?: string;
}
