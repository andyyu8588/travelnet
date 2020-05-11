import { SessionService } from 'src/app/services/session.service';
import { Router } from '@angular/router';
import { SocketService } from 'src/app/services/socket.service';
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
    gender: string,
  }
  propreties: string[]
  values: string[]

  constructor(private socketService: SocketService,
              private sessionService: SessionService,
              private Router: Router) { }

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