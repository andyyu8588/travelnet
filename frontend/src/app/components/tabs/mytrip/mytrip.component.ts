import { MatSortModule, MatSort } from '@angular/material/sort';
import { AddVenuePopoverComponent } from './add-venue-popover/add-venue-popover.component';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { tripModel } from '../../../models/trip.model';
import { Subscription } from 'rxjs';
import { TripService } from './../../../services/trip.service';
import { TripmodalComponent } from 'src/app/components/tabs/mytrip/tripmodal/tripmodal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment'
import { MatAccordion } from '@angular/material/expansion';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { DataSource } from '@angular/cdk/table';

@Component({
  selector: 'app-mytrip',
  templateUrl: './mytrip.component.html',
  styleUrls: ['./mytrip.component.scss']
})
export class MytripComponent implements OnInit, OnDestroy {
  private sessionState_sub: Subscription
  sessionState: boolean
  false: boolean = false

  // trip accordeon
  @ViewChild(MatAccordion) TripAccordion: MatAccordion
  // onTripAccClose() {
  //   this.TripAccordion.closeAll()
  // }
  // onTripAccOpen() {
  //   this.TripAccordion.openAll()
  // }

  // dataSource for mat table
  @ViewChild(MatTable) table: MatTable<any>
  @ViewChild(MatSort) sort: MatSort;
  tableDataSource: MatTableDataSource<tripModel> = new MatTableDataSource([])

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

  // display day of date
  displayDay(date: Date): string {
    let d = new Date(date)
    let weekday: string[] = new Array(7);
    weekday[0] = "Sun";
    weekday[1] = "Mon";
    weekday[2] = "Tue";
    weekday[3] = "Wed";
    weekday[4] = "Thu";
    weekday[5] = "Fri";
    weekday[6] = "Sat";
    let i = d.getDay()
    return weekday[i]
  }

  ok(ok) {
    console.log(ok)
  }

  // get price for a day w/ schedule obj
  getDayPrice(obj: {[key: string]: any}): number {
    let total: number = 0
    if (obj) {
      let venues: any[] = obj.venues? obj.venues : []
      for (let x = 0; x < venues.length; x++) {
        venues[x].price? total += venues[x].price : total += 0  
      }
    }
    return total
  }
  
  // use trip object to get price for all days
  getTotalPrice(obj: tripModel): number {
    let total: number = 0
    if (obj.schedule) {
      obj.schedule.forEach((element) => {
        total += this.getDayPrice(element)
      })
    }
    return total 
  }

  // get venues for a day w/ schedule obj
  getDayVenues(obj: {[key: string]: any}): number {
    if (obj) {
      let venues: any[] = obj.venues? obj.venues: []
      return venues.length
    } else {
      return 0
    }
  }

  // use trip object to get venues for all days
  getTotalVenues(obj: tripModel): number {
    let total: number = 0
    if (obj.schedule) {
      obj.schedule.forEach((element) => {
        total += this.getDayVenues(element)
      })
    }
    return total
  }

  getDataSource(tripIndex: number, dayIndex: number): MatTableDataSource<any> {
    let source = new MatTableDataSource<any>([])
    if (this.trips[tripIndex].schedule) {
      source.data = this.trips[tripIndex].schedule[dayIndex].venues
      source.sort = this.sort
      return source
    } else {
      return source
    }
  }


  constructor(private MatDialog: MatDialog,
              private TripService: TripService,
              private SessionService: SessionService) { 
  }

  ngOnInit(): void {
    this._tripSub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      this.trips = trips
      // this.tableDataSource.data = trips
      // this.tableDataSource.sort = this.sort;
      if (this.table) {
        console.log('oi')
        this.table.renderRows()
      }
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
