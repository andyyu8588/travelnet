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
  }
  propreties: string[]
  values: string[]

  constructor(private socketService: SocketService,
              private Router: Router) { }

  ngOnInit(): void {
    // get user info in database
    this.socketService.emit('searchUser', [sessionStorage.getItem('username')], (data) => {
      if (data.err) {
        console.log(data.err)
      } else {
        console.log(data)
        this.User = (({username, password, email}) => ({username, password, email}))(data.res[0].res)

        // transform object in arrays
        this.propreties = Object.keys(this.User)
        this.values = Object.values(this.User)

        // takeout username
        this.propreties.shift()
        this.values.shift()
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