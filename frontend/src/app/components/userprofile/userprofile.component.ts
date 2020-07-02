import { HttpService } from './../../services/http.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { tab } from '../../models/tab.model';
import { Subscription } from 'rxjs';
import { userModel } from 'src/app/models/user.model';


@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent implements OnInit, OnDestroy {
  url :string = null
  private openTabSub: Subscription
  content: userModel = null
  openTab: tab
  username: string
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
    this.url = this.router.url.replace('/search/user/','')
    this.searchUser(this.url).then(result => this.content = result.users[0])
  }


  goBack(){
    this.SearchService.goBack()
    this.router.navigate([this.openTab.path])
  }
  searchUser(username: string){
    return new Promise<any>((resolve) => {
      this.SearchService.userSearch(username).then(result=>{
      console.log(result)
      resolve(result)
      })
    }
  )}

  ngOnDestroy(){
    this.openTabSub.unsubscribe()
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
