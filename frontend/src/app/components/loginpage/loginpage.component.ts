import { SocketService } from '../../services/socket.service';
import { Component, OnDestroy} from '@angular/core';
import { SessionService } from '../../services/session.service'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl:'./login.component.html',
    styleUrls: ['./loginpage.component.scss'],
})

export class loginComponent {
    modal = null
    constructor(private modalService:NgbModal, private SessionService:SessionService) {
      this.openModal()
    }

    openModal() {
        this.modal = this.modalService.open(LoginComponent,{})
    }
}


@Component({
    selector: 'app-loginpage',
    templateUrl:'./loginpage.component.html',
    styleUrls: ['./loginpage.component.scss'],
    providers:[NgbModalConfig,NgbModal]
})

export class LoginComponent implements OnDestroy{

  constructor(private SocketService: SocketService,
              private sessionService: SessionService,
              private modalService:NgbModal,
              private router:Router,) {}
  ngOnDestroy(){
    this.router.navigate(['/'])
  }


  //handle user login with socket
  loginClicked(password, username, event: Event) {
      if (!(sessionStorage.getItem('username'))) {
      this.SocketService.authenticate(username, password)

      this.SocketService.emit('login', {email: username, password: password}, (data: any) => {
          if (data.err || data === '') {
              console.log(data.err)
          }
          else if (data.res) {
              sessionStorage.setItem('username', data.res)
              localStorage.setItem('username', data.res)
              this.modalService.dismissAll()
              this.sessionService.session()
              console.log(sessionStorage.getItem('username'))
          } else {
              console.log('login fini')
          }
      })
      this.SocketService.authenticator.subscribe((data:any) => {

      })
      }
  }
}
