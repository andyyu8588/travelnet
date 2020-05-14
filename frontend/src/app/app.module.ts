import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './components/registrationpage/registrationpage.component';
import { LoginComponent } from './components/loginpage/loginpage.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ChatwidgetComponent } from './components/chatwidget/chatwidget.component';
import { FriendlistComponent } from './components/friendlist/friendlist.component';
import { HeaderComponent } from './components/header/header.component';
import { FriendComponent } from './components/friendlist/friend/friend.component';
import { MapComponent } from './components/map/map.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { registrationComponent } from './components/registrationpage/registrationpage.component';
import { loginComponent } from './components/loginpage/loginpage.component';
import { ChatsystemComponent } from './components/chatsystem/chatsystem.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ProfileComponent } from './components/profile/profile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { PropretyComponent } from './components/profile/proprety/proprety.component';
import { MatRadioModule } from '@angular/material/radio';
import { ResizableModule  } from 'angular-resizable-element';
import { HttpClientModule } from '@angular/common/http';
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
    MapComponent,
    registrationComponent,
    loginComponent,
    ChatsystemComponent,
    SidebarComponent,
    ProfileComponent,
    PropretyComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    ResizableModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
