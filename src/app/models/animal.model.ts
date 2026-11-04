export interface AnimalCreate {
  nombre: string;
  especie: string;
}

export interface AnimalUpdate {
  nombre?: string;
  especie?: string;
}

export interface AnimalResponse {
  id: string;
  nombre: string;
  especie: string;
}
