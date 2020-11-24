import { SocketService } from './chatsystem/socket.service'
import { Injectable } from '@angular/core'
import { BehaviorSubject, Observable} from 'rxjs'

@Injectable({
  providedIn: 'root'
})

export class SessionService {

  // observable for login state
  private _sessionState: BehaviorSubject<boolean> = new BehaviorSubject(false)
  public sessionState: Observable<boolean> = this._sessionState.asObservable()

  private _sidebarWidth: BehaviorSubject<number> = new BehaviorSubject(window.innerWidth * .4)
  public sidebarWidth: Observable<number> = this._sidebarWidth.asObservable()

  constructor(private SocketService: SocketService) { }

  getRoomName(roomName: string) {
    if (roomName.replace(`${sessionStorage.getItem('username')},`, '').includes(roomName)) {
      return roomName.replace(`,${sessionStorage.getItem('username')}`, '')
    } else {
      return roomName.replace(`${sessionStorage.getItem('username')},`, '')
    }
  }

  session(): boolean {
    if (sessionStorage.getItem('username')) {
      this._sessionState.next(true)
      return true
    } else {
      this._sessionState.next(false)
      return false
    }
  }

  updateSidebarWidth(width: number) {
    this._sidebarWidth.next(width)
  }
}
