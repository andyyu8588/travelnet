import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OpenstreetmapService {

  constructor(private http: HttpClient) {}

  onSendRequest(bbox){
    return this.http
      .get<{[key: string]: any}>(
        environment.openstreetmap.searchNodes,
        {
          headers: {
          },
          params: {

            'bbox': bbox,
          }
      })
  }

  //search for cities with nominatim (geojson response)
  citySearch(city: string) {
    return this.http
      .get<{[key: string]: any}>(
        environment.nominatim.search,
        {
          headers: {},
          params: {
            'city': city,
            'format': 'geojson'
          }
        }
      )
  }
}