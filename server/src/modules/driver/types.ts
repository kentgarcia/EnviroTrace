export interface Driver {
  id: number;
  driverName: string;
  plateNo: string;
  orNo: string;
  transportGroup: string;
  offenses: DriverOffense[];
}

export interface DriverOffense {
  date: string;
  type: string;
  status: string;
  paid: boolean;
}

export interface DriverSearchInput {
  driverName?: string;
  plateNo?: string;
  orNo?: string;
  transportGroup?: string;
}
