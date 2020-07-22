import { tripModel } from './../../../../models/trip.model';
import { Subscription } from 'rxjs';
import { TripService } from './../../../../services/trip.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-add-to-trip-popover',
  templateUrl: './add-to-trip-popover.component.html',
  styleUrls: ['./add-to-trip-popover.component.scss']
})
export class AddToTripPopoverComponent implements OnInit, OnDestroy {

  trips: tripModel[] = null
  trip_sub: Subscription

  constructor(private TripService: TripService) { }

  ngOnInit(): void {
    this.trip_sub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      this.trips = trips
    })
  }

  ngOnDestroy() {
    this.trip_sub.unsubscribe()
  }

}
