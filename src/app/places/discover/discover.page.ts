import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../services/places.service';
import { Place } from '../services/place.model';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Subscription } from 'rxjs';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  isLoading = false;
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
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => (this.isLoading = false));
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(event: CustomEvent<SegmentChangeEventDetail>) {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      if (event.detail.value === 'all') {
        this.relevantPlaces = this.loadedPlaces;
        this.listedLoadedPlaces = this.relevantPlaces.slice(1);
        this.chosenFilter = 'all';
      } else {
        this.relevantPlaces = this.loadedPlaces.filter(
          place => place.userId !== userId,
        );
        this.chosenFilter = 'bookable';
      }
    });
  }
}
