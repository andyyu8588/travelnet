import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { loginComponent } from './components/loginpage/loginpage.component';
import {registrationComponent} from './components/registrationpage/registrationpage.component'


const routes: Routes = [
  { path: 'login', component: loginComponent},
  { path: 'register', component: registrationComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
