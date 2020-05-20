import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class FoursquareService {
  constructor(private http: HttpClient) {}

  onSendRequest(query: string ,lngLag: string){
    return this.http
      .get<{[key: string]: any}>(
        environment.foursquare.venuesSearch,
        {
          headers: {
          },
          params: {
            'client_id': environment.foursquare.clientId,
            'client_secret': environment.foursquare.clientSecret,
            'v': environment.foursquare.v,
            'll': lngLag,
          }
      })
  }
}
