import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable} from 'rxjs'

@Injectable({
  providedIn: 'root'
})

export class SessionService {

// observable for register vs login
private _currentFeature: BehaviorSubject<string> = new BehaviorSubject(null)
public currentFeature: Observable<string> = this._currentFeature.asObservable()

// observable for login state
private _sessionState: BehaviorSubject<boolean> = new BehaviorSubject(false)
public sessionState: Observable<boolean> = this._sessionState.asObservable()


  constructor(private SocketService: SocketService) { }

  session(): any {
    if (sessionStorage.getItem('username')) {
      this._sessionState.next(true)
    } else {
      this._sessionState.next(false)
    }
  }

  changeFeature() {
    this._currentFeature.next(null)
  }
}