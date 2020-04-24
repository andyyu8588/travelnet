import { SocketService } from './../../services/socket.service';
import { Component, OnInit } from '@angular/core';
import{SessionService} from '../../services/session.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  sessionState:boolean
 
  constructor(
    private SessionService:SessionService,
    private SocketService: SocketService) {

      let x = this.SessionService.sessionState.subscribe(x => this.sessionState = x)

  }

  ngOnInit(): void {
    
  }

  //logout user
  logout() {
    let prom = () => {
      return new Promise((resolve, reject) => {
        if(sessionStorage.getItem('username')){
          this.SocketService.emit('logout', sessionStorage.getItem('username'))
          resolve()
        } else {
          reject()
        }
      })
    }

    prom().then(() => {
      sessionStorage.removeItem('username')
      this.SessionService.session()
      console.log('session cleared')
    }).catch(() => {
      console.log('err')
    })
  }
}
