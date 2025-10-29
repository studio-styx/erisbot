export interface Player {
  id: number;
  name: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  position: string;
  shirtNumber: number | null;
}

export interface SquadResponse {
  count: number;
  filters: Record<string, any>;
  squad: Player[];
}