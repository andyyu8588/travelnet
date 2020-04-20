import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentFeature = 'Registration'
  title = 'frontend';
  user = sessionStorage.getItem('username')

  constructor(){
  
  }

  onNavigate(feature: string) {
    this.currentFeature = feature;
  }
}
