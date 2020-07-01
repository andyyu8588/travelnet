import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/services/search.service';
import { tab } from '../../models/tab.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-userprofile',
  templateUrl: './userprofile.component.html',
  styleUrls: ['./userprofile.component.scss']
})
export class UserprofileComponent implements OnInit, OnDestroy {
  url :string = null
  private openTabSub: Subscription
  openTab:tab
  windowHeight: number = window.innerHeight

  constructor(
    private SearchService: SearchService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.openTabSub = this.SearchService.searchTab.subscribe(x => {
      this.openTab = x
    })
    this.url = this.router.url.replace('/search/user/','')

  }


  goBack(){
    this.SearchService.goBack()
    this.router.navigate([this.openTab.path])
  }
  searchUser(username: string){
    return new Promise<any>((resolve, reject) => {
      this.SearchService.userSearch(username).then(result=>{
      resolve(result)
      })
    }
  )}

  ngOnDestroy(){
    this.openTabSub.unsubscribe()
  }

}
