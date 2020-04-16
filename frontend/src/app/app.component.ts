import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentFeature = 'Registration'
  onNavigate(feature: string){
    this.currentFeature = feature;
  }
  title = 'frontend';
  loginstate : boolean
  user = sessionStorage.getItem('username')

  constructor(){
    if(sessionStorage.getItem('username')){
      this.loginstate = false
    } else {
      this.loginstate = true
    }
  }
}
