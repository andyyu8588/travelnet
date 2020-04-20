import { Component, OnInit } from '@angular/core';
import{SessionService} from '../../services/session.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  session:boolean = this.sessionService.session()
 
  constructor(private sessionService:SessionService) {

  }

  ngOnInit(): void {
    
  }

  //logout user
  logout() {
    sessionStorage.clear()
    console.log('session cleared')
    window.location.reload()
  }
}
