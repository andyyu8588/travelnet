import { environment } from './../../../../environments/environment.dev'
import { HttpService } from 'src/app/services/http.service'
import { ActivatedRoute } from '@angular/router'
import { CustomCoordinates } from 'src/app/models/coordinates'
import { LngLatLike, LngLat } from 'mapbox-gl'
import { MapService } from 'src/app/services/map/map.service'
import { MatSort } from '@angular/material/sort'
import { AddVenuePopoverComponent } from './add-venue-popover/add-venue-popover.component'
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core'
import { SessionService } from 'src/app/services/session.service'
import { tripModel } from '../../../models/trip.model'
import { Subscription } from 'rxjs'
import { TripService } from './../../../services/trip.service'
import { TripmodalComponent } from 'src/app/components/tabs/mytrip/tripmodal/tripmodal.component'
import { MatDialog, MatDialogRef } from '@angular/material/dialog'
import * as moment from 'moment'
import { MatAccordion } from '@angular/material/expansion'
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table'
import {CdkDragDrop, moveItemInArray, transferArrayItem} from '@angular/cdk/drag-drop'
import * as Mapboxgl from 'mapbox-gl'
import { last, sample } from 'rxjs/operators'

@Component({
  selector: 'app-mytrip',
  templateUrl: './mytrip.component.html',
  styleUrls: ['./mytrip.component.scss']
})
export class MytripComponent implements OnInit, OnDestroy {
  private sessionState_sub: Subscription
  sessionState: boolean
  isLoading = false
  isErr = false
  isSuccess = false
  sharedTrip: tripModel = null
  sharingUrl: URL | string = null

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
  @ViewChild(MatSort) sort: MatSort
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

  displayedColumns = ['category', 'venueName', 'venueCity', 'venueAddress', 'price', 'url', 'index']

  dialogRef: MatDialogRef<any>

  // all trips of user
  private _tripSub: Subscription
  trips: tripModel[] = []

  // display day of date
  displayDay(date: Date): string {
    const d = new Date(date)
    const weekday: string[] = new Array(7)
    weekday[0] = 'Sun'
    weekday[1] = 'Mon'
    weekday[2] = 'Tue'
    weekday[3] = 'Wed'
    weekday[4] = 'Thu'
    weekday[5] = 'Fri'
    weekday[6] = 'Sat'
    const i = d.getDay()
    return weekday[i]
  }

  // get price for a day w/ schedule obj
  getDayPrice(obj: {[key: string]: any}): number {
    let total = 0
    if (obj) {
      const venues: any[] = obj.venues ? obj.venues : []
      for (let x = 0; x < venues.length; x++) {
        venues[x].price ? total += venues[x].price : total += 0
      }
    }
    return total
  }

  // use trip object to get price for all days
  getTotalPrice(obj: tripModel): number {
    let total = 0
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
      const venues: any[] = obj.venues ? obj.venues : []
      return venues.length
    } else {
      return 0
    }
  }

  // use trip object to get venues for all days
  getTotalVenues(obj: tripModel): number {
    let total = 0
    if (obj.schedule) {
      obj.schedule.forEach((element) => {
        total += this.getDayVenues(element)
      })
    }
    return total
  }

  getTripDistance(tripIndex: number|null, shared?: boolean): string {
    let dist = 0
    let lastCoord: LngLat = null
    const obj = shared ? this.sharedTrip : this.trips[tripIndex]
    for (let x = 0; x < obj.schedule.length; x++) {
      obj.schedule[x].venues.forEach((venue) => {
        if (venue.venueCoord) {
          if (lastCoord === null) {
            lastCoord = new LngLat(venue.venueCoord.lng, venue.venueCoord.lat)
          }
          dist += lastCoord.distanceTo(venue.venueCoord)
          lastCoord = new LngLat(venue.venueCoord.lng, venue.venueCoord.lat)
        }
      })
    }
    return (dist / 1000).toFixed(2)
  }

  getDataSource(tripIndex: number, dayIndex: number, shared?: boolean): MatTableDataSource<any> {
    const source = new MatTableDataSource<any>([])
    const obj = shared ? this.sharedTrip : this.trips[tripIndex]
    if (obj.schedule) {
      source.data = obj.schedule[dayIndex].venues
      source.sort = this.sort
      return source
    } else {
      return source
    }
  }

  constructor(private MatDialog: MatDialog,
              private TripService: TripService,
              private SessionService: SessionService,
              private MapService: MapService,
              private ActivatedRoute: ActivatedRoute,
              private HttpService: HttpService) {
  }

  ngOnInit(): void {
    // if from link
    this.ActivatedRoute.queryParams.subscribe((params) => {
      if (params.tripId) {
        console.log(params)
        this.HttpService.get('/trips', {
          tripId: params.tripId
        })
        .then((res: {trip: tripModel}) => {
          this.sharedTrip = res.trip
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {

        })
      }
    })

    this.isLoading = true
    this._tripSub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      this.trips = trips
      this.isLoading = false
      if (this.table) {
        this.table.renderRows()
      }
    })
    this.sessionState_sub = this.SessionService.sessionState.subscribe((state: boolean) => {
      this.sessionState = state
    })
  }

  changeSharingLink(id: string) {
    this.sharingUrl = environment.travelnetURL + '/mytrip?' + 'tripId=' + id
  }

  /** copy shared trip to own trip */
  copyTrip() {
    this.trips.push(this.sharedTrip)
    this.isLoading = true
    this.TripService.modifyBackend(this.trips)
    .then(() => {
      this.isSuccess = true
    })
    .finally(() => {
      this.isLoading = false
    })
  }

  /** modal for adding a trip */
  openAddTripModal() {
    this.dialogRef = this.MatDialog.open(TripmodalComponent, {
      width: '800px',
      data: {
        name: this.name,
        start: this.start,
        end: this.end
      }
    })

    this.dialogRef.afterClosed().subscribe((result: tripModel) => {
      if (result) {
        this.trips.push(result)
        this.TripService.updateLocal(this.trips)
      }
    })
  }

  /** modal for adding venue */
  openAddVenueModal(tripIndex: number, scheduleIndex: number, venueIndex: number|null) {
    this.dialogRef = this.MatDialog.open(AddVenuePopoverComponent, {
      width: '800px',
      data: {
        tripIndex,
        scheduleIndex,
        venueIndex,
        name: this.venueName,
        venuePrice: this.venuePrice,
        venueCity: this.venueCity,
        venueAddress: this.venueAddress
      }
    })

    this.dialogRef.afterClosed().subscribe((result: any) => {
      // if (result) {
      //   this.trips.push(result)
      //   this.TripService.update(this.trips)
      // }
    })
  }

  /** when row are reordered */
  onListDrop(event: CdkDragDrop<string[]>, tripIndex: number, dayIndex: number) {
    moveItemInArray(this.trips[tripIndex].schedule[dayIndex].venues, event.previousIndex, event.currentIndex)
    this.isLoading = true
    this.TripService.modifyBackend(this.trips)
    .then((res) => {
      this.table.renderRows()
      this.isSuccess = true
    })
    .catch(() => {
      this.isErr = true
    })
    .finally(() => {
      this.isLoading = false
      setTimeout(() => {
        this.isSuccess = false
        this.isErr = false
      }, 1000)
    })
  }

  /** delete one venue  */
  onDeleteVenue(tripIndex: number, dayIndex: number, venueIndex: number) {
    if (confirm(`are you sure you want to delete this venue?`)) {
      console.log( this.trips[tripIndex].schedule[dayIndex].venues[venueIndex])
      this.trips[tripIndex].schedule[dayIndex].venues.splice(venueIndex, 1)
      this.TripService.modifyBackend(this.trips)
      .finally(() => {
        if (this.table) {
          this.table.renderRows()
        }
      })
    } else {

    }
  }

  /** delete entire trip */
  onDeleteTrip(name: string, index: number) {
    if (confirm(`are you sure you want to delete ${name}?`)) {
      this.trips.splice(index, 1)
      this.TripService.modifyBackend(this.trips)
      .finally(() => {
        if (this.table) {
          this.table.renderRows()
        }
      })
    } else {

    }
  }

  /** show itinerary of trip on map */
  showItinerary(tripIndex: number, shared?: boolean) {
    // already showing itinerary
    if (this.MapService.map.getSource('route')) {
      this.MapService.map.removeLayer('route')
      this.MapService.map.removeSource('route')
      this.MapService.map.removeLayer('points')
      this.MapService.map.removeSource('points')
    }
    const obj = shared ? this.sharedTrip : this.trips[tripIndex]
    // push venues in array
    const coord: Array<number[]> = []
    for (const day of obj.schedule) {
      day.venues.forEach((venue) => {
        if (venue.venueCoord) {
          coord.push([venue.venueCoord.lng, venue.venueCoord.lat])

          // show point
          this.MapService.showMarker(1, {
            name: venue.name as string,
            content: {
              geometry: {
                coordinates: [venue.venueCoord.lng, venue.venueCoord.lat]
              }
            }
          })
        }
      })
    }

    // display as route
    this.MapService.map.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coord
        }
      }
    })
    this.MapService.map.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
      'line-join': 'round',
      'line-cap': 'round'
      },
      paint: {
      'line-color': '#3bb2d0',
      'line-width': 8
      }
    })
    this.MapService.map.moveLayer('points')
  }


  /** display location of venue on map */
  showLocation(tripIndex: number, dayIndex: number, venueIndex: number, shared?: boolean) {
    const obj = shared ? this.sharedTrip : this.trips[tripIndex]
    this.MapService.venueOnDestroy()
    const coord: CustomCoordinates = obj.schedule[dayIndex].venues[venueIndex].venueCoord ? new CustomCoordinates(obj.schedule[dayIndex].venues[venueIndex].venueCoord.lng, obj.schedule[dayIndex].venues[venueIndex].venueCoord.lat) : null
    if (coord) {
      this.MapService.addMarker(coord)
    }
  }

  ngOnDestroy() {
    this.MapService.venueOnDestroy()
    this._tripSub.unsubscribe()
    this.sessionState_sub.unsubscribe()
    this.MapService.removeMarker('', null, true)
    if (this.MapService.map.getSource('route')) {
      this.MapService.map.removeLayer('route')
      this.MapService.map.removeSource('route')
      this.MapService.map.removeLayer('points')
      this.MapService.map.removeSource('points')
    }
  }
}
