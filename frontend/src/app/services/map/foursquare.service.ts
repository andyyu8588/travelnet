import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { stringify } from 'querystring';
@Injectable({
  providedIn: 'root'
})

export class FoursquareService {
  constructor(private http: HttpClient) {}

  onSendRequest(query: string ,latLng: string){
    return this.http
      .get<{[key: string]: any}>(
        environment.foursquare.venuesExplore,
        {
          headers: {
          },
          params: {
            'client_id': environment.foursquare.clientId,
            'client_secret': environment.foursquare.clientSecret,
            'v': environment.foursquare.v,
            'll': latLng,
            'query': query
          }
      })
  }
}
