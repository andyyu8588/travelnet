import { environment } from 'src/environments/environment'
import { Injectable } from '@angular/core'
import * as io from 'socket.io-client/dist/socket.io'
import { Observable, BehaviorSubject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})

export class SocketService {
  private socket: any
  room: any
  readonly uri: string = environment.travelnetURL

  constructor() {
    this.socket = io(this.uri)
  }

  listen(eventName: string) {
    return new Observable((sub) => {
      this.socket.on(eventName, (data) => {
        sub.next(data)
      })
    })
  }

  emitO(eventName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject()
      } else {
        this.socket.emit(eventName, data, (ack) => {
          resolve(ack)
      })
      }
    })
  }


  emit(eventName: string, data: any, ack?: (res?: any) => any) {
    this.socket.emit(eventName, data, ack)
  }

  once(eventName: string) {
    return new Observable((sub) => {
      this.socket.once(eventName, (data) => {
        sub.next(data)
      })
    })
  }

  remove(eventName: string) {
    this.socket.removeListener(eventName)
  }

  // disconnects and reconnects to backend
  close() {
    this.socket.close()
  }

  // permanent disconnection from backend
  disconnect() {
    this.socket.disconnect()
  }

  // manually reconnect to backend
  open() {
    this.socket.open()
  }
}
