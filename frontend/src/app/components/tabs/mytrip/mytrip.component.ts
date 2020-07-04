import { AddVenuePopoverComponent } from './add-venue-popover/add-venue-popover.component';
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { tripModel } from '../../../models/trip.model';
import { Subscription } from 'rxjs';
import { TripService } from './../../../services/trip.service';
import { TripmodalComponent } from 'src/app/components/tabs/mytrip/tripmodal/tripmodal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment'
import { numeric } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'app-mytrip',
  templateUrl: './mytrip.component.html',
  styleUrls: ['./mytrip.component.scss']
})
export class MytripComponent implements OnInit, OnDestroy {
  private sessionState_sub: Subscription
  sessionState: boolean
  false: boolean = false

  // data for add trip
  name: string
  start: any
  end: any

  // data for add venue
  venueName: string
  venuePrice: number
  venueCity: string
  venueAddress: string

  displayedColumns= ['venueName', 'venueCity', 'venueAddress', 'price']

  dialogRef: MatDialogRef<any>

  // all trips of user
  private _tripSub: Subscription
  trips: tripModel[] = [] 

  // creates array for ngFor
  arrayOfLength(num: number): Array<any> {
    return [...Array(num).keys()]
  }

  // list dates for each day of trip
  dayIndex(start: Date, index: number): Date {
    return (moment(start).add(index ,"days").toDate())
  }

  constructor(private MatDialog: MatDialog,
              private TripService: TripService,
              private SessionService: SessionService) { 
  }

  ngOnInit(): void {
    this._tripSub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      console.log(trips)
      this.trips = trips
    })
    this.sessionState_sub = this.SessionService.sessionState.subscribe((state: boolean) => {
      this.sessionState = state
    })
  }

  openAddTripModal() {
    this.dialogRef = this.MatDialog.open(TripmodalComponent, {
      width: '800px',
      data: {
        name: this.name,
        start: this.start,
        end: this.end
      }
    });

    this.dialogRef.afterClosed().subscribe((result: tripModel)=> {
      console.log(result)
      if (result) {
        this.trips.push(result)
        this.TripService.updateLocal(this.trips)
      }
    })
  }

  openAddVenueModal(tripIndex: number, scheduleIndex: number) {
    this.dialogRef = this.MatDialog.open(AddVenuePopoverComponent, {
      width: '800px',
      data: {
        tripIndex: tripIndex,
        scheduleIndex: scheduleIndex,
        venueName: this.venueName,
        venuePrice: this.venuePrice,
        venueCity: this.venueCity,
        venueAddress: this.venueAddress
      }
    });

    this.dialogRef.afterClosed().subscribe((result: any)=> {
      console.log(result)
      // if (result) {
      //   this.trips.push(result)
      //   this.TripService.update(this.trips)
      // }
    })
  }

  // confirm action
  onDelete(name: string, index: number) {
    if (confirm(`are you sure you want to delete ${name}?`)) {
      this.trips.splice(index, 1)
      this.TripService.modifyBackend(this.trips)
    } else {

    }
  }

  ngOnDestroy() {
    this._tripSub.unsubscribe()
    this.sessionState_sub.unsubscribe()
  }
}
