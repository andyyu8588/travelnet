import { MapService } from 'src/app/services/map/map.service';
import { tab } from 'src/app/models/tab.model';
import { search } from 'src/app/models/search.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FoursquareService } from './map/foursquare.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { not } from '@angular/compiler/src/output/output_ast';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnDestroy {

  // private openTabs: Array<tab> = []
  // private _searchTabs: BehaviorSubject<any> = new BehaviorSubject(this.openTabs)
  // public searchTabs: Observable<any> = this._searchTabs.asObservable()

  private search: tab = {query: null, path: 'search/', content : [], prePath:null}
  private _searchTab: BehaviorSubject<any> = new BehaviorSubject(this.search)
  public searchTab : Observable<any> = this._searchTab.asObservable()



  private returnSearch: Array<any> = []
  private _searchResults: BehaviorSubject<any> = new BehaviorSubject(this.returnSearch)
  public searchResults: Observable<any> = this._searchResults.asObservable()

  private mapCenterSub: Subscription
  mapCenter: string

  constructor(private HttpClient: HttpClient,
              private foursquareService: FoursquareService,
              private MapService: MapService) {
  }

//looks for venues in the area
  foursquareSearchVenues(query: string, latLng: string, filter: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if(filter == 0 || filter == 1){
        this.foursquareService.searchVenues(query, latLng)
        .subscribe((result) => {
          resolve(result)
        }, (err) => {
          reject(err)
        })
      }
      else{
        resolve(false)
      }
    }
  )}

//gets user info with username input, connection to database
  userSearch(query: string, filter?: number): Promise<any> {
    return new Promise((resolve, reject) => {
      if(filter == 0 || filter == 2){
        this.HttpClient.get<any>(environment.travelnet.searchUsers,
          {
            headers: {
              authorization: localStorage.getItem('token')? localStorage.getItem('token').toString() : 'monkas',
            },
            params: {
              user: query
            }
          }
        )
        .subscribe((result) => {
          resolve(result)
        }, (err) =>{
          reject(err)
        })
      }
      else{
        resolve(false)
      }
    }
  )}

//gets venue data with id in the query
  formatDetails(query: string){
    return new Promise<any>((resolve,reject)=>{
      this.foursquareService.getDetails(query)
      .subscribe(result=>{
        resolve(result)
      }, (err) => {
        reject(err)
      })
    })
  }

//combines both user and venue search
  async mainSearch(query: string, latLng: string, filter?: number): Promise<any> {
    return await Promise.all([this.foursquareSearchVenues(query, latLng, filter), this.userSearch(query, filter)])
  }


//user makes new search in a tab
  enterSearch(query: string, searchType:any) {
    return new Promise((resolve,reject)=>{
      this.resetSearchContent()
      console.log()
      searchType
      .then(result => {
          if(true && !result[0].response.warning){
            result[0].response.groups[0].items.forEach(venue =>{
              this.search.content.push(
                {
                'type':'venue',
                'name' : venue.venue.name,
                'address' : venue.venue.location,
                'formattedAddress' : venue.venue.formattedAddress,
                'category' : (venue.venue.categories)[0].name,
                'reasons' : (venue.reasons.items)[0].summary,
                'Id' : venue.venue.id,
              })
            })
        }
        if (sessionStorage.getItem('username')){
          if (true && result[1].users){
            result[1].users.forEach(user=>{
              this.search.content.push(
                {
                  'type' : 'user',
                  'firstname' : user.firstname,
                  'lastname': user.lastname,
                  'username' : user.username,
                  'profilepicture': user.profilepicture,
                  'email': user.email,
                  'encounters':user.encounters,
                  'history': user.history,
                  'wishlist': user.wishlist
                  })
            })
          }
        }
        else{
          this.search.push({'type' : 'warning', 'name' : 'You must be logged in to see users'})
        }
      this.search = (
        {
        query: query,
        prePath: 'search/',
        path: 'search/' + query,
        content: this.search.content
      }
      )
      console.log(this.search)
      resolve(this._searchTab.next(this.search))
      })
      .catch(err => {
        reject(err)
      })
    })

  }
  getSearchResult(search){
    if (search.type == 'venue'){
      return ('venue: ' + search.name)
    }
    else{
      return ('User: ' + search.name)
    }
  }
  resetSearchContent(){
    this.search.content= []
    this._searchTab.next(this.search)
  }
  updatePath(path){
    this.search.prePath = this.search.path
    this.search.path = path
    this._searchTab.next(this.search)
  }
  goBack(){
    this.search.path = this.search.prePath
    this.search.prePath = 'search/'
    this._searchTab.next(this.search)
    console.log(this.search)
  }


  ngOnDestroy() {
    this.mapCenterSub.unsubscribe()
    this._searchResults.next([])
    this._searchResults.unsubscribe()
    this._searchTab.unsubscribe()
  }
}
