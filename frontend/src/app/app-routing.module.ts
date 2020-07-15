import { Routes, RouterModule } from '@angular/router';

import { RegistrationProcessComponent } from './components/registration-process/registration-process.component';
import { NgModule } from '@angular/core';
import { loginComponent, LoginComponent } from './components/loginpage/loginpage.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HomeComponent } from './components/tabs/home/home.component';
import { MytripComponent } from './components/tabs/mytrip/mytrip.component';
import { MyaccountComponent } from './components/myaccount/myaccount.component';
import { SearchresultsComponent } from './components/tabs/searchresults/searchresults.component';
import { VenueComponent } from './components/venue/venue.component'
import { SearchBarComponent } from './components/search-bar/search-bar.component'
import { UserprofileComponent } from './components/userprofile/userprofile.component'
import { AddPostComponent } from './components/add-post/add-post.component'
import { DisplayPostsComponent } from './components/display-posts/display-posts.component'

const routes: Routes = [
  { path: 'create', component: AddPostComponent },
  { path: 'edit/:postId', component:  AddPostComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationProcessComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'home', component: HomeComponent },
  { path: 'mytrip', component: MytripComponent },
  { path: 'myaccount', component: MyaccountComponent },
  { path: 'search', component: SearchBarComponent, children: [
    { path: 'venue/:query', component: VenueComponent },
    { path: 'user/:query', component: UserprofileComponent },
    { path: '**', component: SearchresultsComponent },
  ]},
  {path: '', redirectTo: 'home', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
