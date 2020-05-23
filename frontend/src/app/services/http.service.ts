import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  serverURL = environment.travelnetURL

  constructor(private http: HttpClient) { }

  get(route: String, params: any) {
    let serverRoute = this.serverURL + route
    return new Promise((resolve, reject) => {
      this.http.get<any>(serverRoute, {
        headers: {
          authorization: localStorage.getItem('token') ? localStorage.getItem('token').toString() : 'monkas'
        },
        params
      }).subscribe((res) => {
        resolve(res)
      }, (err) => {
        reject(err)
      })
    })
  }

  post(route: String, params: any) {
    let serverRoute = this.serverURL + route
    return new Promise((resolve, reject) => {
      this.http.post<any>(serverRoute, {
        headers: {
          authorization: localStorage.getItem('token') ? localStorage.getItem('token').toString() : 'monkas'
        },
        params
      }).subscribe((res) => {
        console.log('a')
        resolve(res)
      }, (err) => {
        console.log('b')
        reject(err)
      })
    })
  }
}