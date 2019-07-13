import { Component, OnInit, OnDestroy } from '@angular/core';
import { Place } from '../../services/place.model';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PlacesService } from '../../services/places.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offer-bookings',
  templateUrl: './offer-bookings.page.html',
  styleUrls: ['./offer-bookings.page.scss'],
})
export class OfferBookingsPage implements OnInit, OnDestroy {
  place: Place;
  private PlaceSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private placesService: PlacesService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
        return;
      }

      this.PlaceSub = this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe(place => (this.place = place));
    });
  }

  ngOnDestroy() {
    if (this.PlaceSub) {
      this.PlaceSub.unsubscribe();
    }
  }
}
