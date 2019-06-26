import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private places: Place[] = [
    {
      id: 'p1',
      title: 'International Integration Coordinator',
      description:
        'Unde sed nemo. Odio libero ab. A unde ducimus quidem assumenda quod.',
      imageUrl: 'http://lorempixel.com/640/480/city',
      price: 895.41,
    },
    {
      id: 'p2',
      title: 'Dynamic Optimization Agent',
      description: 'A unde ducimus quidem assumenda quod.',
      imageUrl: 'http://lorempixel.com/640/480/city',
      price: 5.41,
    },
    {
      id: 'p3',
      title: 'Lead Integration Engineer',
      description:
        'Unde sed nemo. Odio libero ab. A unde ducimus quidem assumenda quod. Unde sed nemo. Odio libero ab. A unde ducimus quidem assumenda quod. Unde sed nemo. Odio libero ab. A unde ducimus quidem assumenda quod.',
      imageUrl: 'http://lorempixel.com/640/480/city',
      price: 95.41,
    },
  ];

  get getPlaces() {
    return [...this.places];
  }

  constructor() {}
}
