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
    this.SocketService.emit('logout', sessionStorage.getItem('username'))
    sessionStorage.clear()
    console.log('session cleared')
    this.SessionService.session()
  }
}
