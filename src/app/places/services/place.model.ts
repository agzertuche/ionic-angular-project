import { PlaceLocation } from './location.model';

export interface Place {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  availableFrom?: Date;
  availableTo?: Date;
  userId: string;
  location: PlaceLocation;
}
