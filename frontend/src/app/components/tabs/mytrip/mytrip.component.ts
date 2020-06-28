import { tripModel } from './trip.model';
import { Subscription } from 'rxjs';
import { TripService } from './../../../services/trip.service';
import { TripmodalComponent } from 'src/app/components/tripmodal/tripmodal.component';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-mytrip',
  templateUrl: './mytrip.component.html',
  styleUrls: ['./mytrip.component.scss']
})
export class MytripComponent implements OnInit, OnDestroy {
  // @Input() name: String = "Sample Trip"
  // @Input() places: Array<any> = []

  name: string
  start: any
  end: any

  dialogRef: MatDialogRef<any>

  private _tripSub: Subscription
  trips: tripModel[] = null

  private dialogref_sub: Subscription

  constructor(private MatDialog: MatDialog,
              private TripService: TripService) { 
  }

  ngOnInit(): void {
    this._tripSub = this.TripService.trips.subscribe((trips: tripModel[]) => {
      this.trips = trips
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

    this.dialogref_sub = this.dialogRef.afterClosed().subscribe(result => {
      console.log(result);
    })
  }

  ngOnDestroy() {
    this._tripSub.unsubscribe()
  }
}
