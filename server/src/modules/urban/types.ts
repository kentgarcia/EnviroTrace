export interface SeedlingItem {
  name: string;
  quantity: number;
}

export interface SeedlingRequest {
  id: string;
  dateReceived: string;
  requesterName: string;
  address: string;
  items: SeedlingItem[];
  notes?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface UrbanGreeningItem {
  name: string;
  quantity: number;
}

export interface UrbanGreening {
  id: string;
  date: string;
  establishmentName: string;
  plantedBy: string;
  items: UrbanGreeningItem[];
  total: number;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface UrbanGreeningStats {
  ornamentalPlants: number;
  trees: number;
}

export interface UrbanGreeningBreakdown {
  seeds: number;
  seedsPrivate: number;
  trees: number;
  ornamentals: number;
}

export interface UrbanOverview {
  plantSaplingsCollected: number;
  urbanGreening: UrbanGreeningStats;
  urbanGreeningBreakdown: UrbanGreeningBreakdown;
}

export interface SeedlingRequestFilters {
  requesterName?: string;
  startDate?: string;
  endDate?: string;
}

export interface UrbanGreeningFilters {
  establishmentName?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}
