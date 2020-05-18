import { MapService } from 'src/app/services/map.service';
import { tab } from './../components/sidebar/tab.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FoursquareService } from './foursquare.service';
import { SocketService } from './socket.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private openTabs: Array<tab> = [{title: 'Home'}, {title: 'Discover'}, {title: 'My Trip'}]
  private _searchTabs: BehaviorSubject<any> = new BehaviorSubject(this.openTabs)
  public searchTabs: Observable<any> = this._searchTabs.asObservable()

  constructor(private HttpClient: HttpClient,
              private SocketService: SocketService,
              private foursquareService: FoursquareService,
              private MapService: MapService) {

  }

  foursquareSearch(query: string, lnglat: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.foursquareService.onSendRequest(query, lnglat)
      .subscribe((result) => {
        resolve(result)
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

  async mainSearch(query: string, lnglat: string): Promise<any> {
    return await Promise.all([this.foursquareSearch(query, lnglat), this.friendSearch(query)])
  }

  // when user opens new tab
  newSeach(query: string) {
    this.openTabs.push({
      title: query,
      content: 'Loading'
    })
    this._searchTabs.next(this.openTabs)
    let lnglat = this.MapService.map.getCenter()
    console.log(lnglat)
    this.mainSearch(query, lnglat)
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
}
