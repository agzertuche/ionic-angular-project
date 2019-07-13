import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../services/places.service';
import { Place } from '../services/place.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  private placesSub: Subscription;
  private chosenFilter = 'all';

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.placesSub = this.placesService.getPlaces.subscribe(places => {
      this.loadedPlaces = places;
      if (this.chosenFilter === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          place => place.userId !== this.authService.getUserId,
        );
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      }
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'all') {
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
      this.chosenFilter = 'all';
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(
        place => place.userId !== this.authService.getUserId,
      );
      this.chosenFilter = 'bookable';
    }
  }
}
