import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { loginComponent } from './components/sidebar/header/loginpage/loginpage.component';
import { registrationComponent} from './components/registration-process/registrationpage/registrationpage.component'
import { ProfileComponent } from './components/sidebar/header/profile/profile.component';
import { DiscoverComponent } from './components/sidebar/header/tabs/discover/discover.component';
import { HomeComponent } from './components/sidebar/header/tabs/home/home.component';
import { MytripComponent } from './components/sidebar/header/tabs/mytrip/mytrip.component';
import { MyaccountComponent } from './components/sidebar/header/tabs/myaccount/myaccount.component';
import { SearchresultsComponent } from './components/sidebar/header/tabs/searchresults/searchresults.component';

const routes: Routes = [
  {path: 'login', component: loginComponent},
  {path: 'register', component: registrationComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'discover', component: DiscoverComponent},
  {path: 'home', component: HomeComponent},
  {path: 'mytrip', component: MytripComponent},
  {path: 'myaccount', component: MyaccountComponent},
  {path: 'searchresults', component: SearchresultsComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
