import { environment } from 'src/environments/environment';
import { FoursquareService } from './foursquare.service';
import { SocketService } from './socket.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private HttpClient: HttpClient,
              private SocketService: SocketService,
              private foursquareService: FoursquareService) {

  }

  foursquareSearch(value: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.foursquareService.onSendRequest(value)
      .subscribe((result) => {
        resolve(console.log(result.response))
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
            // authorization: localStorage.getItem('token')
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
}
