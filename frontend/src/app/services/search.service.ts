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

  private openTabs: Array<any> = ['Home', 'Discover','My Trip']
  private _searchTabs: BehaviorSubject<any> = new BehaviorSubject(this.openTabs)
  public searchTabs: Observable<any> = this._searchTabs.asObservable()

  constructor(private HttpClient: HttpClient,
              private SocketService: SocketService,
              private foursquareService: FoursquareService) {

  }

  foursquareSearch(value: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.foursquareService.onSendRequest(value)
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

  async mainSearch(value: string): Promise<any> {
    return await Promise.all([this.foursquareSearch(value), this.friendSearch(value)])
  }

  // when user opens new tab
  newSeach(query: string) {
    this._searchTabs.next(this.openTabs)
    this.mainSearch(query)
    .then(result => {
      result.forEach(element => {
        this.openTabs.push(element)
      });
      this._searchTabs.next(this.openTabs)
    })
    .catch(err => {
      console.log(err)
    })
  }
}
