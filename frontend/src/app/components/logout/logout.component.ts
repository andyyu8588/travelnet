import { SocketService } from './../../services/socket.service';
import { Component, OnInit } from '@angular/core';
import{SessionService} from '../../services/session.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  session:boolean = this.SessionService.session()
 
  constructor(
    private SessionService:SessionService,
    private SocketService: SocketService) {

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
