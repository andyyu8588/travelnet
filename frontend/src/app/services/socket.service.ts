import { Injectable } from '@angular/core';
import * as io from "socket.io-client/dist/socket.io";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket: any
  socket2: any
  readonly uri: string = 'http://localhost:3000'

  constructor() { 
    this.socket = io(this.uri)
  }

  listen(eventName: string){
    return new Observable((sub) => {
      this.socket.on(eventName, (data) => {
        sub.next(data)
      })
    })
  }

  emit(eventName: string, data: any){
    this.socket.emit(eventName, data)
  }

  once(eventName: string){
    return new Observable((sub) => {
      this.socket.once(eventName, (data) => {
        sub.next(data)
      })
    })
  }

  remove(eventName: string) {
    this.socket.removeListener(eventName)
  }

  //disconnects and reconnects to backend
  close() {
    this.socket.close()
  } 

  //permanent disconnection from backend
  disconnect(num) {
    if(num === 1){
      this.socket.disconnect()
    } else {
      this.socket2.disconnect()
    }
  }

  //manually reconnect to backend
  open() {
    this.socket.open()
  }
}
