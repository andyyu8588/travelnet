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

  constructor(private socketService: SocketService,
              private Router: Router) {

  }

  ngOnInit(): void {
    // get user info in database
    this.socketService.emit('searchUser', [sessionStorage.getItem('username')], (data) => {
      if (data.err) {
        console.log(data.err)
      } else {
        console.log(data)
        this.User = (({username, password, email}) => ({username, password, email}))(data.res[0].res)
      }
    })
  }

  onChange(proprety: string) {

  }

  onExit() {
    this.ngOnDestroy()
  }

  ngOnDestroy() {
    this.Router.navigate(['./'])
  }
}