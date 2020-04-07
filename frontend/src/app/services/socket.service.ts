import { Injectable } from '@angular/core';
import * as io from './socket.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService {

  constructor() { }

  socket: any;

  listen(eventName: string){
    
  }

}
