import { MapService } from 'src/app/services/map/map.service';
import { tab } from 'src/app/components/tabs/tab.model';
import { search } from 'src/app/components/tabs/searchresults/search/search.model';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FoursquareService } from './map/foursquare.service';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';

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



  private returnSearch: Array<search> = []
  private _searchResults: BehaviorSubject<any> = new BehaviorSubject(this.returnSearch)
  public searchResults: Observable<any> = this._searchResults.asObservable()

  private mapCenterSub: Subscription
  mapCenter: string

  constructor(private HttpClient: HttpClient,
              private foursquareService: FoursquareService,
              private MapService: MapService) {
  }


  foursquareSearchVenues(query: string, latLng: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.foursquareService.searchVenues(query, latLng)
      .subscribe((result) => {
        resolve(result)
      }, (err) => {
        reject(err)
      })
    })
  }

  userSearch(value: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.HttpClient.get<any>(environment.travelnet.searchUsers,
        {
          headers: {
            authorization: localStorage.getItem('token')? localStorage.getItem('token').toString() : 'monkas',
          },
          params: {
            user: value
          }
        }
      )
      .subscribe((response) => {
        resolve(response)
      }, (err) => {
        reject(err)
      })
    })
  }

  async mainSearch(query: string, latLng: string): Promise<any> {
    return await Promise.all([this.foursquareSearchVenues(query, latLng), this.userSearch(query)])
  }

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

  //user makes new search in a tab
  newSeach(query: string, latLng:string) {
    return new Promise((resolve,reject)=>{
      this.search.content= []
      this._searchTab.next(this.search)
      // this._searchTabs.next(this.openTabs)
      this.mainSearch(query, latLng)
      .then(result => {
        if (!result[0].response.warning){
        result[0].response.groups[0].items.forEach( venue =>{
          this.returnSearch.push(
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
        if (sessionStorage.getItem('username'))
          if (result[1].users){
            result[1].users.forEach(user=>{
              this.returnSearch.push(
                {
                  'type' : 'user',
                  'name' : user.name,
                  'id' : user.username


                  })
            })
          }
          else{
            this.returnSearch.push({'type' : 'warning', 'name' : 'You must be logged in to see users'})
          }
      }
      this.search = (
        {
        query: query,
        prePath: 'search/',
        path: 'search/' + query,
        content: this.returnSearch
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
  resetSearch(){
    this.returnSearch = []
    this._searchResults.next([])
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


  // getTabIndex(Tab:any){
  //   return this.openTabs.indexOf(Tab)
  // }


  // deleteTab(Tab:any){
  //   // console.log('tab at index '+this.openTabs.indexOf(Tab)+ ' was deleted')
  //   this.openTabs.splice(this.openTabs.indexOf(Tab),1)
  //   this._searchTabs.next(this.openTabs)
  // }

  ngOnDestroy() {
    this.mapCenterSub.unsubscribe()
    this._searchResults.next([])
    this._searchResults.unsubscribe()
    this._searchTab.unsubscribe()
  }
}
