import { SocketService } from './socket.service';
import { Injectable } from '@angular/core';
import {BehaviorSubject,Observable} from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class SessionService {

//observable for register vs login
private _currentFeature: BehaviorSubject<string> = new BehaviorSubject(null)
public currentFeature: Observable<string> = this._currentFeature.asObservable()

// observable for login state
private _sessionState: BehaviorSubject<boolean> = new BehaviorSubject(false)
public sessionState: Observable<boolean> = this._sessionState.asObservable()


  constructor(private SocketService: SocketService) { }

  session(): any {
    this.SocketService.emit('UserIn', sessionStorage.getItem('username') ? sessionStorage.getItem('username'): '')
    this.SocketService.once('UserIn_res').subscribe((data: any) => {
      if(data.res){
        this._sessionState.next(true)
      } else if (data.err) {
        sessionStorage.removeItem('username')
        this._sessionState.next(false)
      }
    })
  }

  changeFeature() {
    this._currentFeature.next(null)
  }
}
