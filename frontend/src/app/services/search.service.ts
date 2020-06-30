import { MapService } from 'src/app/services/map/map.service';
import { tab } from 'src/app/models/tab.model';
import { venueModel } from 'src/app/models/venue.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FoursquareService } from './map/foursquare.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService implements OnDestroy {

  private search: tab = {query: null, path: 'search/', content : {'users':[], 'venues':[]}, prePath:null}
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
  foursquareSearchVenues(query: string, latLng: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.foursquareService.searchVenues(query, latLng)
      .subscribe((result) => {
        resolve(result)
      }, (err) => {
        reject(err)
      })
    }
  )}

//gets user info with username input, connection to database
  userSearch(query: string): Promise<any> {
    return new Promise((resolve, reject) => {
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
  async mainSearch(query: string, latLng: string): Promise<any> {
    return await Promise.all([this.foursquareSearchVenues(query, latLng), this.userSearch(query)])
  }


//user makes new search in a tab
  enterSearch(query: string, searchType:any) {
    return new Promise((resolve,reject)=>{
      this.resetSearchContent()
      searchType
      .then(result => {
          if(true && !result[0].response.warning){
            result[0].response.groups[0].items.forEach(venue =>{
              this.search.content.venues.push(venue)
            })
        }
        if (sessionStorage.getItem('username')){
          if (true && result[1].users){
            result[1].users.forEach(user=>{
              this.search.content.users.push(user)
          })
        }}
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
    this.search.content= {venues:[],users:[]}
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
