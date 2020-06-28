import { userModel } from './../../models/user.model';
import { HttpService } from 'src/app/services/http.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { promise } from 'protractor';
import { resolve } from 'dns';

@Component({
  selector: 'app-tripmodal',
  templateUrl: './tripmodal.component.html',
  styleUrls: ['./tripmodal.component.scss']
})
export class TripmodalComponent implements OnInit {
  
  modalForm: FormGroup
  isLoading: boolean = false
  nameErr: boolean = false

  constructor(
    public dialogRef: MatDialogRef<TripmodalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      name: string
      start: any,
      end: any
    },
    private HttpService: HttpService)
  {
    this.modalForm = new FormGroup({
      'name': new FormControl(null, [Validators.required, Validators.minLength(1)], this.checkName.bind(this)),
      'dateRange': new FormGroup({
        'start': new FormControl(null),
        'end': new FormControl(null)
      })
    })
  }

  ngOnInit(): void {
  }

  checkName(control: FormControl): Promise<any> {
    return new Promise((resolve, reject) => {
      this.HttpService.get('/user', {})
      .then((response: {
        [key: string]: any
        user: userModel
      }) => {
        let trips = response.user.trips
        for (let x = 0; x < trips.length; x++) {
          console.log(trips[x].name, control.value)
          if(trips[x].name == control.value) {
            resolve({err: 'name already exists'})
            break
          }
        }
        resolve(null)
      })
      .catch(err => {
        resolve({err: err})      
      })
    })
  }

  onSubmit(data: any) {
    this.isLoading = true
    

  }

  onCancel() {
    this.dialogRef.close()
  }
}
