import { RegistrationProcessComponent } from './components/registration-process/registration-process.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { loginComponent, LoginComponent } from './components/sidebar/header/loginpage/loginpage.component';
import { registrationComponent} from './components/registration-process/registrationpage/registrationpage.component'
import { ProfileComponent } from './components/sidebar/header/profile/profile.component';
import { HomeComponent } from './components/sidebar/header/tabs/home/home.component';
import { MytripComponent } from './components/sidebar/header/tabs/mytrip/mytrip.component';
import { MyaccountComponent } from './components/sidebar/header/tabs/myaccount/myaccount.component';
import { SearchresultsComponent } from './components/sidebar/header/tabs/searchresults/searchresults.component';
import { VenueComponent } from './components/venue/venue.component'
import { SearchBarComponent } from './components/search-bar/search-bar.component'
const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegistrationProcessComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'home', component: HomeComponent},
  {path: 'mytrip', component: MytripComponent},
  {path: 'myaccount', component: SearchBarComponent},
  {path: 'search', component: SearchBarComponent, children: [
    {path: 'venue', component: VenueComponent, children: [
      {path: ':query', component: VenueComponent},
    ]},
    {path: ':query', component: SearchresultsComponent},
  ]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
