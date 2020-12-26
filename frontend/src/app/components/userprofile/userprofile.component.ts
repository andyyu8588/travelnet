import { HttpService } from './../../services/http.service'
import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { SearchService } from 'src/app/services/search.service'
import { tab } from '../../models/tab.model'
import { Subscription } from 'rxjs'
import { userModel } from 'src/app/models/user.model'


@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent implements OnInit, OnDestroy {
  url: string = null
  private openTabSub: Subscription
  content: userModel = null
  openTab: tab
  username: string
  selfUsername: string
  windowHeight: number = window.innerHeight


  constructor(
    private SearchService: SearchService,
    private router: Router,
    private HttpService: HttpService
  ) { }

  ngOnInit(): void {
    this.openTabSub = this.SearchService.searchTab.subscribe(x => {
      this.openTab = x
    })
    this.url = this.router.url.replace('/search/user/', '')
    this.searchUser(this.url).then(result => this.content = result.users[0])
    this.username = this.router.url.substr(13)
    this.selfUsername = localStorage.getItem('username')
  }

  goBack(){
    this.router.navigate(['search', this.openTab.query])
  }

  searchUser(username: string){
    return new Promise<any>((resolve) => {
      this.SearchService.userSearch(username).then(result => {
      console.log(result)
      resolve(result)
      })
    }
  ) }

  ngOnDestroy(){
    this.openTabSub.unsubscribe()
  }

  // follow button
  onFollow() {
    // update database
    this.HttpService.post('/user/follow', {
      username: localStorage.getItem('username'),
      followed: this.username
    }).then((res) => {
      // add the follower in current content
      this.content.followers.push(this.selfUsername)
    }).catch((err) => {
      console.log(err)
    })
  }

  // unfollow button
  onUnfollow() {
    // update database
    this.HttpService.post('/user/unfollow', {
      username: localStorage.getItem('username'),
      unfollowed: this.username
    }).then((res) => {
      // remove the follower from current content
      this.content.followers.splice(this.content.followers.indexOf(this.selfUsername), 1)
    }).catch((err) => {
      console.log(err)
    })
  }
}
