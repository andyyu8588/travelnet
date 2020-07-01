import { HttpService } from './../../services/http.service';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent implements OnInit {
  username: string

  constructor(private router: Router, private HttpService: HttpService) { }

  ngOnInit(): void {
    this.username = this.router.url.substr(13)
  }

  onAdd() {
    this.HttpService.post('/user/add', {
      username: localStorage.getItem('username'),
      added: this.username
    }).then((res) => {
      console.log(res)
    }).catch((err) => {
      console.log(err)
    })
  }
}
