import { BehaviorSubject, Observable } from 'rxjs';
import { HttpService } from './http.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripService {

  private _trips: BehaviorSubject<any[]> = new BehaviorSubject([])
  public trips: Observable<any[]> = this._trips.asObservable()

  constructor(private HttpService: HttpService) {

  }
}
