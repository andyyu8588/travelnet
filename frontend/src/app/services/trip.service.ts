import { tripModel } from './../components/tabs/mytrip/trip.model';
import { environment } from './../../environments/environment.prod';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private _trips: BehaviorSubject<tripModel[]> = new BehaviorSubject([])
  public trips: Observable<tripModel[]> = this._trips.asObservable()

  constructor(private HttpService: HttpService) {
    this.HttpService.get(environment.travelnet.getUserInfo, {})
    .then((response: any) => {
      this._trips.next(response.user.trips)
    })
    .catch(err => {
      console.log(err)
    })
  }
}
