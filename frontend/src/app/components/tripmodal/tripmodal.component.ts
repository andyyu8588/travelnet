import { tripModel } from './../tabs/mytrip/trip.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-tripmodal',
  templateUrl: './tripmodal.component.html',
  styleUrls: ['./tripmodal.component.scss']
})
export class TripmodalComponent implements OnInit {
  

  constructor(
    public dialogRef: MatDialogRef<TripmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: tripModel) {
  }

  ngOnInit(): void {
  }

}
