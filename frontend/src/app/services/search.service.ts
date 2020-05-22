import { MapService } from 'src/app/services/map/map.service';
import { tab } from './../components/sidebar/tab.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FoursquareService } from './map/foursquare.service';
import { SocketService } from './chatsystem/socket.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnInit, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnDestroy {

  private openTabs: Array<tab> = [{title: 'Home',path:'home'}, {title: 'Discover',path:'discover'}, {title: 'My Trip',path:'mytrip'}]
  private _searchTabs: BehaviorSubject<any> = new BehaviorSubject(this.openTabs)
  public searchTabs: Observable<any> = this._searchTabs.asObservable()

  private mapCenterSub: Subscription
  mapCenter: string

  constructor(private HttpClient: HttpClient,
              private SocketService: SocketService,
              private foursquareService: FoursquareService,
              private MapService: MapService) {
  }


  foursquareSearch(query: string, latLng: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.foursquareService.onSendRequest(query, latLng)
      .subscribe((result) => {
        console.log(result.response.groups[0].items)
        resolve(result)
      }, (err) => {
        reject(err)
      })
    })
  }

  userSearch(value: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.HttpClient.get<any>(environment.travelnet.searchUsers,
        {
          headers: {
            authorization: localStorage.getItem('token')? localStorage.getItem('token').toString() : 'monkas',
          },
          params: {
            user: value
          }
        }
      )
      .subscribe((response) => {
        console.log(response)
        resolve(response)
      }, (err) => {
        reject(err)
      })
    })
  }

  async mainSearch(query: string, latLng: string): Promise<any> {
    return await Promise.all([this.foursquareSearch(query, latLng), this.userSearch(query)])
  }

  // when user opens new tab
  newSeach(query: string,latLng:string) {
    this.openTabs.push({
      title: query,
      path: 'searchresults',
      content: 'Loading'
    })
    this._searchTabs.next(this.openTabs)
    this.mainSearch(query, latLng)
    .then(result => {
      console.log(result[0].response.warning)
      console.log(result[1])
      result.forEach(element => {
        this.openTabs[this.openTabs.length].content.push(element)
      });
      this._searchTabs.next(this.openTabs)
    })
    .catch(err => {
      console.log(err)
    })
  }
  deleteTab(i:number){
    this.openTabs.splice(i,1)
    this._searchTabs.next(this.openTabs)
  }

  ngOnDestroy() {
    this.mapCenterSub.unsubscribe()
  }
}
