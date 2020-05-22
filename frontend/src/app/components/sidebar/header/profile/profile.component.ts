import { HttpService } from './../../../../services/http.service';
import { environment } from './../../../../../environments/environment';
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
    // get user info in database
    this.socketService.emit('searchUser', [sessionStorage.getItem('username')], (data) => {
      if (data.err) {
        console.log(data.err)
      } else {
        this.User = (({username, password, email, firstname, lastname, birthdate, gender}) =>
          ({username, password, email, firstname, lastname, birthdate, gender}))(data.res[0].res)

        // transform object in arrays
        this.propreties = Object.keys(this.User)
        this.values = Object.values(this.User)

        // takeout username
        this.propreties.shift()
        this.values.shift()
      }
    })
  }

  getProfile() {
    // this.httpService.get('/profile', null).then((res) => {
    //   // this.User.gender = res.friendlist
    // }).catch((err) => {
    //   console.log(err)
    // })
  }

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

  onExit() {
    this.ngOnDestroy()
  }

  ngOnDestroy() {
    this.Router.navigate(['./'])
  }
}
