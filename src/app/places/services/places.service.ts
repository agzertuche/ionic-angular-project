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
    return this.authService.getToken.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get<{ [key: string]: Place }>(
          `${this.getApiUrl()}?auth=${token}`,
        );
      }),
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
    return this.authService.getToken.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.get(this.getApiUrl(`/${id}.json?auth=${token}`));
      }),
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

    return this.authService.getToken.pipe(
      take(1),
      switchMap(token => {
        return this.httpClient.post<{ imageUrl: string; imagePath: string }>(
          'https://us-central1-ionic-project1-dab73.cloudfunctions.net/storeImage',
          uploadData,
          { headers: { Authorization: 'Bearer ' + token } },
        );
      }),
    );
  }

  addPlace(place: Place) {
    let newPlace = {
      ...place,
    };

    let firebaseId;
    let fetchUserId: string;

    return this.authService.getUserId.pipe(
      take(1),
      switchMap(userId => {
        fetchUserId = userId;
        return this.authService.getToken;
      }),
      take(1),
      switchMap(token => {
        if (!fetchUserId) {
          throw new Error('No user found!');
        }

        newPlace.userId = fetchUserId;

        return this.httpClient.post<{ name: string }>(
          `${this.getApiUrl()}?auth=${token}`,
          newPlace,
        );
      }),
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
    let fetchedToken: string;

    return this.authService.getToken.pipe(
      take(1),
      switchMap(token => {
        fetchedToken = token;
        return this.places;
      }),
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
        return this.httpClient.put(
          this.getApiUrl(`/${id}.json?auth=${fetchedToken}`),
          {
            ...updatedPlaces[updatedPlaceIndex],
            id: null,
          },
        );
      }),
      tap(() => {
        this.places.next(updatedPlaces);
      }),
    );
  }
}
