import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {RegistrationComponent} from './components/registrationpage/registrationpage.component';
import {LoginComponent} from './components/loginpage/loginpage.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ChatwidgetComponent } from './components/chatwidget/chatwidget.component';
import { FriendlistComponent } from './components/friendlist/friendlist.component';
import {HeaderComponent} from './components/header/header.component';
import { FriendComponent } from './components/friendlist/friend/friend.component';
@NgModule({
  declarations: [
    AppComponent,
    RegistrationComponent,
    LoginComponent,
    LogoutComponent,
    ChatwidgetComponent,
    FriendlistComponent,
    HeaderComponent,
    FriendComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
