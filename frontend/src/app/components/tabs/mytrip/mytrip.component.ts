import { Component, OnInit, OnDestroy } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { tripModel } from '../../../models/trip.model';
import { Subscription } from 'rxjs';
import { TripService } from './../../../services/trip.service';
import { TripmodalComponent } from 'src/app/components/tabs/mytrip/tripmodal/tripmodal.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mytrip',
  templateUrl: './mytrip.component.html',
  styleUrls: ['./mytrip.component.scss']
})
export class MytripComponent implements OnInit, OnDestroy {
  private sessionState_sub: Subscription
  sessionState: boolean
  false: boolean = false
  name: string
  start: any
  end: any

  dialogRef: MatDialogRef<any>

  // all trips of user
  private _tripSub: Subscription
  trips: any[] = [] 
  // = [{name: 'lit', dateRange: {start: 'ss', end:'dd'}, schedule: [{venues: [{venueName: 'dd'}]}]}]

  private dialogref_sub: Subscription

  constructor(private MatDialog: MatDialog,
              private TripService: TripService,
              private SessionService: SessionService) { 
  }

  ngOnInit(): void {
    this._tripSub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      // this.trips = trips
    })
    this.sessionState_sub = this.SessionService.sessionState.subscribe((state: boolean) => {
      this.sessionState = state
    })
  }

  openModal() {
    this.dialogRef = this.MatDialog.open(TripmodalComponent, {
      width: '800px',
      data: {
        name: this.name,
        start: this.start,
        end: this.end
      }
    });

    this.dialogref_sub = this.dialogRef.afterClosed().subscribe((result: tripModel)=> {
      console.log(result)
      if (result) {
        this.trips.push(result)
        this.TripService.update(this.trips)
      }
    })
  }

  // confirm action
  onDelete(name: string, index: number) {
    if (confirm(`are you sure you want to delete ${name}?`)) {
      this.trips.splice(index, 1)
      this.TripService.modify(this.trips)
    } else {

    }
  }

  ngOnDestroy() {
    this._tripSub.unsubscribe()
    this.sessionState_sub.unsubscribe()
  }
}
