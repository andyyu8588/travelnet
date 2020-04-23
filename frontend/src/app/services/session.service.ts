import { Injectable } from '@angular/core';
import {BehaviorSubject,Observable} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SessionService {

//creating observable
private _currentFeature: BehaviorSubject<string> = new BehaviorSubject(null)
public currentFeature: Observable<string> = this._currentFeature.asObservable()



  constructor() { }

  session(): any {
    if(sessionStorage.getItem('username')){
      return true
    } else {
      return false
    }
  }
  changeFeature(){
    this._currentFeature.next(null)
  }
}
