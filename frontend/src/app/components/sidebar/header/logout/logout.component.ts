import { Router } from '@angular/router';
import { SocketService } from '../../../../services/socket.service';
import { Component, OnInit } from '@angular/core';
import { SessionService } from '../../../../services/session.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  sessionState:boolean

  constructor(private SessionService:SessionService,
              private SocketService: SocketService,
              private router: Router) {
      let x = this.SessionService.sessionState.subscribe(x => this.sessionState = x)
  }

  ngOnInit(): void {

  }

  // logout user
  logout() {
    let prom = () => {
      return new Promise((resolve, reject) => {
        if (sessionStorage.getItem('username')) {
          this.SocketService.emit('logout', sessionStorage.getItem('username'), (data) => {
            if (data.res) {
              localStorage.removeItem('username')
              sessionStorage.removeItem('username')
              resolve()
            } else if (data.err) {
              reject(data.err)
            }
          })
        } else {
          reject('wtf')
        }
      })
    }

    prom().then(() => {
      this.SessionService.session()
      window.location.reload()
      console.log('session cleared')
    }).catch((err) => {
      console.log(err)
    })
  }
}
