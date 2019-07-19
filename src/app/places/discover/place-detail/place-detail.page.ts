import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NavController,
  ModalController,
  ActionSheetController,
  LoadingController,
  AlertController,
} from '@ionic/angular';
import { CreateBookingComponent } from '../../../bookings/create-booking/create-booking.component';
import { PlacesService } from '../../services/places.service';
import { Place } from '../../services/place.model';
import { Subscription } from 'rxjs';
import { BookingService } from 'src/app/bookings/services/booking.service';
import { Booking } from 'src/app/bookings/services/booking.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { MapModalComponent } from 'src/app/shared/map-modal/map-modal/map-modal.component';
import { switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private PlaceSub: Subscription;
  isBookable: boolean;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private placesService: PlacesService,
    private actionSheetCtrl: ActionSheetController,
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private alertCtrl: AlertController,
    private router: Router,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
        return;
      }
      this.isLoading = true;
      let fetchedUserId: string;
      this.authService.getUserId
        .pipe(
          take(1),
          switchMap(userId => {
            if (!userId) {
              throw new Error('Found no user!');
            }

            fetchedUserId = userId;
            return this.placesService.getPlace(paramMap.get('placeId'));
          }),
        )
        .subscribe(
          place => {
            this.place = place;
            this.isBookable = place.userId !== fetchedUserId;
            this.isLoading = false;
          },
          error => {
            this.alertCtrl
              .create({
                header: 'An error ocurred',
                message: 'Try again later...',
                buttons: [
                  {
                    text: 'Okay',
                    handler: () => {
                      this.router.navigate(['/places/tabs/discover']);
                    },
                  },
                ],
              })
              .then(alertElem => alertElem.present());
          },
        );
    });
  }

  ngOnDestroy() {
    if (this.PlaceSub) {
      this.PlaceSub.unsubscribe();
    }
  }

  onBookPlace() {
    this.actionSheetCtrl
      .create({
        cssClass: 'custom-sheet',
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

  onShowFullMap() {
    this.modalCtrl
      .create({
        component: MapModalComponent,
        componentProps: {
          center: {
            lat: this.place.location.lat,
            lng: this.place.location.lng,
          },
          selectable: false,
          closeButtonText: 'Close',
          title: this.place.location.address,
        },
      })
      .then(modalElem => {
        modalElem.present();
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
