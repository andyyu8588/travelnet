import { Router } from '@angular/router'
import { userModel } from 'src/app/models/user.model'
import { HttpService } from 'src/app/services/http.service'
import { Component, OnInit } from '@angular/core'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  user: userModel

  constructor(private HttpService: HttpService, private Router: Router) { }

  ngOnInit(): void {
    // get user info
    this.HttpService.get('/user', null).then((res: any) => {
      this.user = res.user[0]
    })
  }

  getProfile(username: string) {
    this.Router.navigate(['/search/user/' + username])
  }
}
