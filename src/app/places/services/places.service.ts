import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { take, map, tap, delay, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PlacesService {
  private places = new BehaviorSubject<Place[]>([]);
  private getApiUrl = (path?) =>
    `https://ionic-project1-dab73.firebaseio.com/offered-places${
      path ? path : '.json'
    }`;

  get getPlaces() {
    return this.places.asObservable();
  }

  constructor(
    private authService: AuthService,
    private httpClient: HttpClient,
  ) {}

  fetchPlaces() {
    return this.httpClient.get<{ [key: string]: Place }>(this.getApiUrl()).pipe(
      map(response => {
        const places: Place[] = [];
        for (const key in response) {
          if (response.hasOwnProperty(key)) {
            const element = response[key];
            places.push({
              ...element,
              id: key,
              availableFrom: new Date(element.availableFrom),
              availableTo: new Date(element.availableTo),
            });
          }
        }
        return places;
      }),
      tap(places => {
        this.places.next(places);
      }),
    );
  }

  getPlace(id: string) {
    return this.httpClient.get(this.getApiUrl(`/${id}.json`)).pipe(
      map(
        (place: Place): Place => {
          return {
            ...place,
            id,
            availableFrom: new Date(place.availableFrom),
            availableTo: new Date(place.availableTo),
          };
        },
      ),
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.httpClient.post<{ imageUrl: string; imagePath: string }>(
      'https://us-central1-ionic-project1-dab73.cloudfunctions.net/storeImage',
      uploadData,
    );
  }

  addPlace(place: Place) {
    const newPlace = {
      ...place,
      userId: this.authService.getUserId,
    };

    let firebaseId;
    return this.httpClient
      .post<{ name: string }>(this.getApiUrl(), newPlace)
      .pipe(
        switchMap(response => {
          firebaseId = response.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = firebaseId;
          this.places.next(places.concat(newPlace));
        }),
      );
  }

  updatePlace(id, title, description) {
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(p => p.id === id);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = {
          ...oldPlace,
          title,
          description,
        };
        return this.httpClient.put(this.getApiUrl(`/${id}.json`), {
          ...updatedPlaces[updatedPlaceIndex],
          id: null,
        });
      }),
      tap(() => {
        this.places.next(updatedPlaces);
      }),
    );
  }
}
