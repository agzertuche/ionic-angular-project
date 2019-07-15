import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from './services/booking.service';
import { Booking } from './services/booking.model';
import { IonItemSliding, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-bookings',
  templateUrl: './bookings.page.html',
  styleUrls: ['./bookings.page.scss'],
})
export class BookingsPage implements OnInit, OnDestroy {
  loadedBookings: Booking[];
  isLoading = false;
  private bookgingsSup: Subscription;

  constructor(
    private bookingService: BookingService,
    private loadingCtrl: LoadingController,
  ) {}

  ngOnInit() {
    this.bookgingsSup = this.bookingService.getBookings.subscribe(bookings => {
      this.loadedBookings = bookings;
    });
  }

  ngOnDestroy() {
    if (this.bookgingsSup) {
      this.bookgingsSup.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.bookingService
      .fetchBookings()
      .subscribe(() => (this.isLoading = false));
  }

  onCancelBooking(bookingId: string, slidingEl: IonItemSliding) {
    slidingEl.close();
    this.loadingCtrl.create({ message: 'Cancelling...' }).then(loadingElem => {
      loadingElem.present();
      this.bookingService.cancelBooking(bookingId).subscribe(() => {
        loadingElem.dismiss();
      });
    });
  }
}
