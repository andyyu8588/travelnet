import { TripmodalComponent } from 'src/app/components/tripmodal/tripmodal.component';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-mytrip',
  templateUrl: './mytrip.component.html',
  styleUrls: ['./mytrip.component.scss']
})
export class MytripComponent implements OnInit, OnDestroy {
  @Input() name: String = "Sample Trip"
  @Input() places: Array<any> = []
  dialogRef

  panelOpenState = false;
  trips: any[] = ['berlin', 'washington', 'china', 'wassp']

  constructor(private MatDialog: MatDialog) { }

  ngOnInit(): void {
  }

  openModal() {
    this.dialogRef = this.MatDialog.open(TripmodalComponent, {
      width: '800px',
    });

    this.dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    })
  }

  ngOnDestroy() {
  }
}
