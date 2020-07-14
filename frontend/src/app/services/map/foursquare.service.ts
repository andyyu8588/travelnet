import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class FoursquareService {
  constructor(private http: HttpClient) {}

  /** takes lat,lng */
  searchVenues (query: string, latLng: string, near?: string) {
    return this.http
      .get<{[key: string]: any}>(
        environment.foursquare.venuesExplore,
        {
          headers: {
          },
          params: {
            'client_id': environment.foursquare.clientId,
            'client_secret': environment.foursquare.clientSecret,
            'v': this.getCurrentDate(),
            'll': latLng,
            'query': query
          }
    })
  }

  getDetails(query: string) {
    return this.http
      .get<{[key: string]: any}>(
        environment.foursquare.venueDetails+'/'+query,
        {
          headers: {
          },
          params: {
            'client_id': environment.foursquare.clientId,
            'client_secret': environment.foursquare.clientSecret,
            'v': this.getCurrentDate(),
          }
    })
  }

  userAuth() {
    let url = environment.foursquare.userAuth+
    '?client_id='+environment.foursquare.clientId+
    '&response_type='+'code'+
    '&redirect_uri='+'http://localhost:4200/'
    console.log(url)
    window.location.replace(url)
  }

  updateCategories() {
    return this.http
      .get<{[key: string]: any}>(
        environment.foursquare.getCategories+'/',
        {
          headers: {
          },
          params: {
            'client_id': environment.foursquare.clientId,
            'client_secret': environment.foursquare.clientSecret,
            'v': this.getCurrentDate(),
          }
    })
  }

  getCurrentDate(): string {
    let dt = new Date();
    let month: string
    let day: string
    if (dt.getMonth.toString().length != 2){
      month = ''+ 0 + dt.getMonth()
    }
    else{
      month = dt.getMonth().toString()
    }
    if (dt.getDay.toString().length !=2){
      day = '' + 0 + dt.getDay()
    }
    else{
      day = dt.getDay().toString()
    }
    return (dt.getFullYear().toString() + month + day)
  }
}
