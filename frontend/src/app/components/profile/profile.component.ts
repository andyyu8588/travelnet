import { HttpService } from 'src/app/services/http.service';
import { environment } from 'src/environments/environment';
import { SessionService } from 'src/app/services/session.service';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/services/chatsystem/socket.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  User: {
    username: string,
    password: string,
    email: string,
    firstname: string,
    lastname: string,
    birthdate: string,
    gender: any,
  }
  propreties: string[]
  values: string[]

  constructor(private socketService: SocketService,
              private sessionService: SessionService,
              private Router: Router,
              private httpService: HttpService) { }

  ngOnInit(): void {
    // http request to get user info
    this.getProfile()
  }

  getProfile() {
    this.httpService.get('/user', null).then((res: any) => {
      this.User = (({username, password, email, firstname, lastname, birthdate, gender}) =>
          ({username, password, email, firstname, lastname, birthdate, gender}))(res.user[0])

      // transform object in arrays
      this.propreties = Object.keys(this.User)
      this.values = Object.values(this.User)

      // takeout username
      this.propreties.shift()
      this.values.shift()
    }).catch((err) => {
      console.log(err)
    })
  }

  // delete account function
  onDelete() {
      this.Router.navigate(['./'])
      this.socketService.emit('deleteUser', sessionStorage.getItem('username'), (data) => {
      if (data.err) {
        console.log(data.err)
      } else {
        console.log(data.res)
        localStorage.removeItem('username')
        sessionStorage.removeItem('username')
        this.sessionService.session()
        window.location.reload()
        console.log('session cleared')
      }
    })
  }

  // back button that destroys component
  onExit() {
    this.ngOnDestroy()
  }

  ngOnDestroy() {
    this.Router.navigate(['./'])
  }
}
