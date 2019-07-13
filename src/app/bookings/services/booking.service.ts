import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/services/auth.service';
import { take, delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private bookings = new BehaviorSubject<Booking[]>([]);

  get getBookings() {
    return this.bookings.asObservable();
  }

  constructor(private authService: AuthService) {}

  addBooking(booking: Booking) {
    const newBooking: Booking = {
      ...booking,
      id: Math.random().toString(),
      userId: this.authService.getUserId,
    };

    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this.bookings.next(bookings.concat(newBooking));
      }),
    );
  }

  cancelBooking(bookingId: string) {
    return this.bookings.pipe(
      take(1),
      delay(1000),
      tap(bookings => {
        this.bookings.next(
          bookings.filter(booking => booking.id !== bookingId),
        );
      }),
    );
  }
}
