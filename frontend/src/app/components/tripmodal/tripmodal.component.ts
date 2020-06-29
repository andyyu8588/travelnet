import { tripModel } from './../tabs/mytrip/trip.model';
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

  onSubmit(data: any) {
    this.isLoading = true
    let valid = this.checkName({value: data.name})
    if (typeof(valid) == 'string') {
      this.isLoading = false
    } else {
      console.log('passed')
      this.trips.push({
        name: data.name,
        date: {
          start: data.start,
          end: data.end
        },
      })
      this.HttpService.patch('/edit', {
        username: localStorage.getItem('username'),
        proprety: 'trips',
        newProprety: this.trips
      })
      .then((response: any) => {
        if (response.message) {
          this.dialogRef.close({
            date: {
              start: data.start,
              end: data.end
            },
            name: data.name
          })
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
