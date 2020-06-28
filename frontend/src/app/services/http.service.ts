import { environment } from './../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

// http service that gives httpclient to everything

export class HttpService {
  serverURL = environment.travelnetURL

  constructor(private http: HttpClient) { }

  delete(route: String, params: any) {
    let serverRoute = this.serverURL + route
    return new Promise((resolve, reject) => {
      this.http.delete<any>(serverRoute, {
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

  get(route: String, params: any) {
    let serverRoute = this.serverURL + route
    return new Promise((resolve, reject) => {
      this.http.get<any>(serverRoute, {
        headers: {
          authorization: localStorage.getItem('token')? localStorage.getItem('token').toString() : 'monkas'
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
      this.http.post<any>(serverRoute,        
        params
      ).subscribe((res) => {
        resolve(res)
      }, (err) => {
        reject(err)
      })
    })
  }

  put(route: String, params: any) {
    let serverRoute = this.serverURL + route
    return new Promise((resolve, reject) => {
      this.http.put<any>(serverRoute, {
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

  patch(route: string, params: any) {
    let serverRoute = this.serverURL + route
    return new Promise((resolve, reject) => {
      this.http.patch<any>(serverRoute, {
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
}