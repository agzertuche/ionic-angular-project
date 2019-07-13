import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
} from '@ionic/angular';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { PlacesService } from '../../services/places.service';
import { Place } from '../../services/place.model';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/services/booking.service';
import { Booking } from 'src/app/bookings/services/booking.model';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private PlaceSub: Subscription;
  isBookable: boolean;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private placesService: PlacesService,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.PlaceSub = this.placesService
        .getPlace(paramMap.get('placeId'))
        .subscribe(place => {
          this.place = place;
          this.isBookable = place.userId !== this.authService.getUserId;
        });
    });
  }

  ngOnDestroy() {
    if (this.PlaceSub) {
      this.PlaceSub.unsubscribe();
    }
  }

  onBookPlace() {
    console.log('onbookplace');
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navCtrl.navigateBack('/places/tabs/discover');
    // this.navCtrl.pop();

    this.actionSheetCtrl
      .create({
        header: 'Choose an Action',
        buttons: [
          {
            text: 'Select Date',
            handler: () => {
              this.openBookingModal('select');
            },
          },
          {
            text: 'Random Date',
            handler: () => {
              this.openBookingModal('random');
            },
          },
          {
            text: 'Cancel',
            role: 'cancel',
          },
        ],
      })
      .then(actionSheetElem => {
        actionSheetElem.present();
      });
  }

  openBookingModal(mode: 'select' | 'random') {
    this.modalCtrl
      .create({
        component: CreateBookingComponent,
        componentProps: { selectedPlace: this.place, selectedMode: mode },
      })
      .then(modalElement => {
        modalElement.present();
        return modalElement.onDidDismiss();
      })
      .then(resultData => {
        if (resultData.role === 'confirm') {
          this.loadingCtrl
            .create({
              message: 'Booking place...',
            })
            .then(loadingElem => {
              loadingElem.present();
              const { id, title, imageUrl } = this.place;
              const newBooking: Booking = {
                id: undefined,
                placeId: id,
                userId: undefined,
                placeTitle: title,
                placeImage: imageUrl,
                firstName: resultData.data.bookingData.firstName,
                lastName: resultData.data.bookingData.lastName,
                guestNumber: resultData.data.bookingData.guestNumber,
                bookedFrom: resultData.data.bookingData.startDate,
                bookedTo: resultData.data.bookingData.endDate,
              };
              this.bookingService.addBooking(newBooking).subscribe(() => {
                loadingElem.dismiss();
              });
            });
        }
      });
  }
}
