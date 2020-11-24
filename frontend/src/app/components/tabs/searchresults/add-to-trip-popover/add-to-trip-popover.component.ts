import { tripModel } from './../../../../models/trip.model'
import { Subscription } from 'rxjs'
import { TripService } from './../../../../services/trip.service'
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core'
import { MatSelectionList, MatListOption } from '@angular/material/list'

@Component({
  selector: 'app-add-to-trip-popover',
  templateUrl: './add-to-trip-popover.component.html',
  styleUrls: ['./add-to-trip-popover.component.scss']
})
export class AddToTripPopoverComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSelectionList) MatSelectionList: MatSelectionList
  @Output() onSubmitEvent = new EventEmitter<MatListOption[]>()
  trips: tripModel[] = null
  trip_sub: Subscription

  constructor(private TripService: TripService) { }

  ngOnInit(): void {
    this.trip_sub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      this.trips = trips
    })
  }

  ngAfterViewInit() {
  }

  onSubmit() {
    this.onSubmitEvent.emit(this.MatSelectionList.selectedOptions.selected)
  }

  ngOnDestroy() {
    this.trip_sub.unsubscribe()
  }

}
