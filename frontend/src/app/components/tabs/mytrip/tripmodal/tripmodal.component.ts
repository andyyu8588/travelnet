import { HttpService } from 'src/app/services/http.service';
import { tripModel } from '../../../../models/trip.model';
import { userModel } from './../../../../models/user.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-tripmodal',
  templateUrl: './tripmodal.component.html',
  styleUrls: ['./tripmodal.component.scss']
})
export class TripmodalComponent implements OnInit {

  minDate: Date = new Date()
  
  modalForm: FormGroup
  isLoading: boolean = false
  nameErr: boolean = false

  trips: tripModel[]

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

  checkName(control: {[key: string]: any}): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.HttpService.get('/user', {})
      .then((response: {
        [key: string]: any
        user: userModel[]
      }) => {
        let trips: tripModel[] = response.user[0].trips? response.user[0].trips : null
        if (trips) {
          this.trips = trips
          for (let x = 0; x < trips.length; x++) {
            if(trips[x].name == control.value) {
              resolve('name already exists')
              break
            }
          }
          resolve(null)
        } else {
          resolve(null)
        }
      })
      .catch(err => {
        console.log('err', err)
        reject(err.message)      
      })
    })
  }

  onSubmit(data: {
    [key:string]: any
    start: Date
    end: Date}) {
    this.isLoading = true
    let valid = this.checkName({value: data.name})
    if (typeof(valid) == 'string') {
      this.isLoading = false
    } else {
      this.trips.push(
        new tripModel(data.start, data.end, data.name)
      )
      this.HttpService.patch('/user/edit', {
        'username': localStorage.getItem('username'),
        'proprety': 'trips',
        'newProprety': this.trips
      })
      .then((response: any) => {
        if (response.message) {
          this.dialogRef.close(
            new tripModel(data.start, data.end, data.name)
          )
        }
      })
      .catch(err => {
        console.log(err)
      })
      .finally(() => {
        this.isLoading = false
      })
    }
  }

  onCancel() {
    this.dialogRef.close()
  }
}
