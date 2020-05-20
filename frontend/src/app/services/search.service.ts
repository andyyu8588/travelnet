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

  private openTabs: Array<tab> = [{title: 'Home'}, {title: 'Discover'}, {title: 'My Trip'}]
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
        resolve(result.response.venues)
      }, (err) => {
        reject(err)
      })
    })
  }

  friendSearch(value: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.HttpClient.get<any>(environment.travelnet.searchFriends,
        {
          headers: {
            authorization: localStorage.getItem('token')? localStorage.getItem('token').toString() : 'monkas'
          },
          params: {
            list: value
          }
        }
      )
      .subscribe((response) => {
        resolve(response)
      }, (err) => {
        reject(err)
      })
    })
  }

  async mainSearch(query: string, latLng: string): Promise<any> {
    return await Promise.all([this.foursquareSearch(query, latLng), this.friendSearch(query)])
  }

  // when user opens new tab
  newSeach(query: string) {
    this.openTabs.push({
      title: query,
      content: 'Loading'
    })
    this._searchTabs.next(this.openTabs)
    this.mainSearch(query, this.mapCenter)
    .then(result => {
      result.forEach(element => {
        this.openTabs[this.openTabs.length].content.push(element)
      });
      this._searchTabs.next(this.openTabs)
    })
    .catch(err => {
      console.log(err)
    })
  }

  ngOnDestroy() {
    this.mapCenterSub.unsubscribe()
  }
}
