import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private places = new BehaviorSubject<Place[]>([
    {
      id: 'p1',
      title: 'International Integration Coordinator',
      description:
        'Unde sed nemo. Odio libero ab. A unde ducimus quidem assumenda quod.',
      imageUrl: 'http://lorempixel.com/640/480/city',
      price: 895.41,
      availableFrom: new Date('2019-05-07'),
      availableTo: new Date('2019-09-30'),
      userId: 'asc',
    },
    {
      id: 'p2',
      title: 'Dynamic Optimization Agent',
      description: 'A unde ducimus quidem assumenda quod.',
      imageUrl: 'http://lorempixel.com/640/480/city',
      price: 5.41,
      availableFrom: new Date('2019-05-07'),
      availableTo: new Date('2019-09-30'),
      userId: 'asc',
    },
    {
      id: 'p3',
      title: 'Lead Integration Engineer',
      description:
        'Unde sed nemo. Odio libero ab. A unde ducimus quidem assumenda quod. Unde sed nemo. Odio libero ab. A unde ducimus quidem assumenda quod. Unde sed nemo. Odio libero ab. A unde ducimus quidem assumenda quod.',
      imageUrl: 'http://lorempixel.com/640/480/city',
      price: 95.41,
      availableFrom: new Date('2019-05-07'),
      availableTo: new Date('2019-09-30'),
      userId: 'asc',
    },
  ]);

  get getPlaces() {
    return this.places.asObservable();
  }

  constructor(private authService: AuthService) {}

  getPlace(id: string) {
    return this.places.pipe(
      take(1),
      map(places => {
        return { ...places.find(place => place.id === id) };
      }),
    );
  }

  addPlace(place: Place) {
    const newPlace = {
      ...place,
      id: Math.random().toString(),
      userId: this.authService.getUserId,
      imageUrl: 'http://lorempixel.com/640/480/city',
    };

    return this.places.pipe(
      take(1),
      delay(1000),
      tap(places => {
        this.places.next(places.concat(newPlace));
      }),
    );
  }

  updatePlace(id, title, description) {
    return this.places.pipe(
      take(1),
      delay(1000),
      tap(places => {
        const updatedPlaceIndex = places.findIndex(p => p.id === id);
        const updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = {
          ...oldPlace,
          title,
          description,
        };
        this.places.next(updatedPlaces);
      }),
    );
  }
}
