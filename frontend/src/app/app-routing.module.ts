import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './components/loginpage/loginpage.component';
import { RegistrationComponent} from './components/registrationpage/registrationpage.component'
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegistrationComponent},
  {path: 'profile', component: ProfileComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
