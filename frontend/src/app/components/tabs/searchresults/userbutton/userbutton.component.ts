import { HttpService } from 'src/app/services/http.service'
import { userModel } from 'src/app/models/user.model'
import { Component, OnInit, Input } from '@angular/core'
import { SearchService } from 'src/app/services/search.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-userbutton',
  templateUrl: './userbutton.component.html',
  styleUrls: ['./userbutton.component.scss']
})
export class UserbuttonComponent implements OnInit {
  pathID: string
  searchResult: any
  @Input() result: userModel
  selfUsername: string = localStorage.getItem('username')

  constructor(
    private searchservice: SearchService,
    private router: Router,
    private HttpService: HttpService,
  ) { }

  ngOnInit(): void {
    console.log(this.result)
    this.searchResult = this.result
    this.pathID = '/search/user/' + this.result.username
  }

  navigate() {
    console.log(this.result)
    this.router.navigate([this.pathID])
  }

  // follow button
  onFollow() {
    // update database
    this.HttpService.post('/user/follow', {
      username: localStorage.getItem('username'),
      followed: this.result.username
    }).then((res) => {
      // add the follower in current content
      this.result.followers.push(localStorage.getItem('username'))
    }).catch((err) => {
      console.log(err)
    })
  }

  // unfollow button
  onUnfollow() {
    // update database
    this.HttpService.post('/user/unfollow', {
      username: localStorage.getItem('username'),
      unfollowed: this.result.username
    }).then((res) => {
      // remove the follower from current content
      this.result.followers.splice(this.result.followers.indexOf(localStorage.getItem('username')), 1)
    }).catch((err) => {
      console.log(err)
    })
  }
}
