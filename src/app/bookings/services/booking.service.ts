import { Injectable } from '@angular/core';
import { Booking } from './booking.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private bookings: Booking[] = [
    {
      id: 'b1',
      placeId: '7ee98fb0-8252-4c26-8dc0-ca44a6e06a78',
      placeTitle: 'Martinside',
      guestNumber: 3,
      userId: 'abc',
    },
    {
      id: 'b2',
      placeId: '7ee98fb0-8252-4c26-8dc0-ca44a6e06a79',
      placeTitle: 'New Douglasshire',
      guestNumber: 2,
      userId: 'abc',
    },
    {
      id: 'b3',
      placeId: '7ee98fb0-8252-4c26-8dc0-ca44a6e06a77',
      placeTitle: 'Klinghaven',
      guestNumber: 1,
      userId: 'abc',
    },
  ];

  get getBookings() {
    return [...this.bookings];
  }

  constructor() {}

  getBooking(id: string) {
    return { ...this.bookings.find(booking => booking.id === id) };
  }
}
