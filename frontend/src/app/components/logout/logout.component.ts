import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  
  session(): any   {
    if(sessionStorage.getItem('username')){
      return true
    } else {
      return false
    }
  }

  hideContent : boolean
  user : boolean
  
  constructor() { 
    if(!(sessionStorage.getItem('username'))){
      this.user = false   
    } else {
      this.user = true
    }
  } 

  ngOnInit(): void {
    
  }

  logout(){
    sessionStorage.clear()
    console.log('session cleared')
    window.location.reload()
  }
}
