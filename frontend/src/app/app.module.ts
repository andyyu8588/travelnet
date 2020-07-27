import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RegistrationComponent } from './components/registration-process/registrationpage/registrationpage.component';
import { LoginComponent } from './components/loginpage/loginpage.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ChatwidgetComponent } from './components/chatsystem/chatwidget/chatwidget.component';
import { FriendlistComponent } from './components/chatsystem/friendlist/friendlist.component';
import { HeaderComponent } from './components/header/header.component';
import { FriendComponent } from './components/chatsystem/friendlist/friend/friend.component';
import { MapComponent } from './components/map/map.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RxReactiveFormsModule } from "@rxweb/reactive-form-validators"
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
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatStepperModule } from '@angular/material/stepper';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { RegistrationProcessComponent } from './components/registration-process/registration-process.component';
import { SearchresultsComponent } from './components/tabs/searchresults/searchresults.component';
import { HomeComponent } from './components/tabs/home/home.component';
import { MyaccountComponent } from './components/myaccount/myaccount.component';
import { MytripComponent } from './components/tabs/mytrip/mytrip.component';
import { CountrySelectorComponent } from './components/registration-process/country-selector/country-selector.component';
import { CountryList } from 'country-list';
import { VenueButtonComponent } from './components/tabs/searchresults/VenueButton/VenueButton.component';
import { TripmodalComponent } from './components/tabs/mytrip/tripmodal/tripmodal.component'
import { VenueComponent } from './components/venue/venue.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ListObjectPipe } from './pipes/list-object.pipe';
import { NullPipe } from './pipes/null.pipe';
import { UserprofileComponent } from './components/userprofile/userprofile.component';
import { UserbuttonComponent } from './components/tabs/searchresults/userbutton/userbutton.component';
import { AddVenuePopoverComponent } from './components/tabs/mytrip/add-venue-popover/add-venue-popover.component';
import { CitySearchComponent } from './components/city-search/city-search.component';
import { FilterComponent } from './components/filter/filter.component';
import { ScrollToTopComponent } from './components/sidebar/scroll-to-top/scroll-to-top.component';
import { AddPostComponent } from './components/add-post/add-post.component';
import { DisplayPostsComponent } from './components/display-posts/display-posts.component';
import { CommentSectionComponent } from './components/comment-section/comment-section.component';
import { CommentComponent } from './components/comment/comment.component';
import { AddToTripPopoverComponent } from './components/tabs/searchresults/add-to-trip-popover/add-to-trip-popover.component'
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ArrayToPipePipe } from './pipes/array-to-pipe.pipe';
import { EditCommentComponent } from './components/edit-comment/edit-comment.component';
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
    loginComponent,
    ChatsystemComponent,
    SidebarComponent,
    ProfileComponent,
    PropretyComponent,
    RegistrationProcessComponent,
    SearchresultsComponent,
    HomeComponent,
    MyaccountComponent,
    MytripComponent,
    CountrySelectorComponent,
    VenueButtonComponent,
    TripmodalComponent,
    VenueComponent,
    SearchBarComponent,
    ListObjectPipe,
    NullPipe,
    UserprofileComponent,
    UserbuttonComponent,
    AddVenuePopoverComponent,
    CitySearchComponent,
    FilterComponent,
    ScrollToTopComponent,
    AddPostComponent,
    DisplayPostsComponent,
    CommentSectionComponent,
    CommentComponent,
    AddToTripPopoverComponent,
    ArrayToPipePipe,
    EditCommentComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule,
    NgbModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatRadioModule,
    ResizableModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
    HttpClientModule,
    DragDropModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
