import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class FoursquareService {
  constructor(private http: HttpClient) {}

  searchVenues(query: string ,latLng: string){
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
  getDetails(query: string){
    return this.http
      .get<{[key: string]: any}>(
        environment.foursquare.venueDetails+'/'+query,
        {
          headers: {
          },
          params: {
            'client_id': environment.foursquare.clientId,
            'client_secret': environment.foursquare.clientSecret,
            'v': environment.foursquare.v,
          }
    })
  }
  userAuth(){
    let url = environment.foursquare.userAuth+
    '?client_id='+environment.foursquare.clientId+
    '&response_type='+'code'+
    '&redirect_uri='+'http://localhost:4200/'
    console.log(url)
    window.location.replace(url)
  }


}
