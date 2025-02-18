export interface Brand {
    brandId?: number;  // có thể optional nếu create
    name: string;
    logoUrl?: string;
    description?: string;
    status?: boolean;
  }
  