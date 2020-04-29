import { SocketService } from './socket.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class MessagingService {

  private _socketRoom: BehaviorSubject<string> = new BehaviorSubject('')
  public socketRoom: Observable<string> = this._socketRoom.asObservable()
  
  constructor(private SocketService: SocketService) { }

}
