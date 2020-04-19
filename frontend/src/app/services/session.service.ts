import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor() { }

  session(): any   {
    if(sessionStorage.getItem('username')){
      return true
    } else {
      return false
    }
  }
}
