import { SessionService } from 'src/app/services/session.service';
import { userModel } from './../models/user.model';
import { tripModel } from '../models/trip.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HttpService } from './http.service';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TripService implements OnDestroy {
  private sessionState_sub: Subscription
  sessionState: boolean = this.SessionService.session()

  // query settings from mytrip add venue
  searchedVenue: string = null

  private _trips: BehaviorSubject<tripModel[]> = new BehaviorSubject(null)
  public trips: Observable<tripModel[]> = this._trips.asObservable()

  constructor(private HttpService: HttpService,
              private SessionService: SessionService) {
    // check if user is logged in and retrieve trip data
    this.sessionState_sub = this.SessionService.sessionState.subscribe((state: boolean) => {
      if (state) {
        this.sessionState = state
        this.HttpService.get('/user', {})
        .then((response: {
          [key: string]: any
          user: userModel[]
        }) => {
          if (response.user) {
            this._trips.next(response.user[0].trips)
          }
        })
        .catch(err => {
          console.log(err)
        })
      }
    })
  }

  /** when user searches/finished searching a venue from mytrip -> add venue */ 
  changeQuery(query: string | null) {
    this.searchedVenue = query
  }

  /** modifies trips of user */ 
  modifyBackend(triparr: tripModel[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.HttpService.patch('/user/edit', {
        username: localStorage.getItem('username'),
        proprety: 'trips',
        newProprety: triparr
      })
      .then((response: {[key: string]: any}) => {
        this._trips.next(triparr)
        resolve(response)
      })
      .catch(err => {
        reject(err)
      })
    })
  }

  /**localy update trips of user (when modification is already done)*/
  updateLocal(triparr: tripModel[]) {
    this._trips.next(triparr)
  }

  ngOnDestroy() {
    this.sessionState_sub.unsubscribe()
  }
}
