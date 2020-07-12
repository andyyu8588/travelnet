import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/services/chatsystem/socket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SessionService } from 'src/app/services/session.service'

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit, OnDestroy {
  sessionState:boolean
  private sessionSate_sub: Subscription

  constructor(private SessionService:SessionService,
              private SocketService: SocketService,
              private router: Router) {
    this.sessionSate_sub = this.SessionService.sessionState.subscribe((x: boolean) => this.sessionState = x)
  }

  ngOnInit(): void {

  }

  // logout user
  logout() {
    if (sessionStorage.getItem('username')) {
      this.SocketService.emit('logout', sessionStorage.getItem('username'), (data) => {
        if (data.res) {
          this.SessionService.session()
        }
      })
    }
    localStorage.removeItem('username')
    sessionStorage.clear()
    window.location.reload()
  }

  ngOnDestroy() {
    this.sessionSate_sub.unsubscribe()
  }
}
