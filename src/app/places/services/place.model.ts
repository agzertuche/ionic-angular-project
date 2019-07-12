export interface Place {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: number;
  availableFrom?: Date;
  availableTo?: Date;
}
