import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  session = () => {
    let x = sessionStorage.getItem('username')
    if(x){
      return true
    }
  }
  hideContent : boolean
  user : boolean
  
  constructor() { 
    sessionStorage.clear
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
