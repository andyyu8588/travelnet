import * as Mapboxgl  from 'mapbox-gl';
import { geocodeResponseModel } from './../../models/geocodeResp.model';
import { OpenstreetmapService } from './openstreetmap.service';
import { SessionService } from 'src/app/services/session.service';
import { CustomCoordinates } from './../../models/coordinates';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Injectable, OnInit, Input, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { GeoJsonTypes } from 'geojson';


export class featureGEOJSONModel {
  public type: String
  public geometry: {
    type: String,
    coordinates: number[]
  }
  public properties?: {
    [key: string]: any
    title: string
    icon?: string
  }

  constructor(title: string, coordinates: number[]) {
    this.type = 'Feature'
    this.geometry = {
      'type': 'Point',
      'coordinates': coordinates
    }
    this.properties = {
      title: title,
      'marker-color': '#3c4e5a',
      'marker-symbol': 'marker-15',
      'marker-size': 'large',
    }
  }
}

export interface clickLocationCoordinates {
  [key: string]: any
  lng: number
  lat: number
}

@Injectable({
  providedIn: 'root'
})
export class MapService implements OnDestroy{
  citySearchPresent: boolean = null

  private _fakeCenter: BehaviorSubject<mapboxgl.LngLatLike | CustomCoordinates> = new BehaviorSubject(null)
  public fakeCenter : Observable<mapboxgl.LngLatLike | CustomCoordinates> = this._fakeCenter.asObservable()

  private _fakeCenterCity: BehaviorSubject<{[key: string]: any}> = new BehaviorSubject({})
  public fakeCenterCity : Observable<{[key: string]: any}> = this._fakeCenterCity.asObservable()


  lngOffset: number
  map: Mapboxgl.Map
  venueLocation: Mapboxgl.Marker

  private _clickLocation: BehaviorSubject<clickLocationCoordinates> = new BehaviorSubject({
    lat: null,
    lng: null
  })
  clickLocation: Observable<clickLocationCoordinates> = this._clickLocation.asObservable()

  private Places: Array<featureGEOJSONModel[]> = [[],[]]

  private sidebarWidth_sub: Subscription
  sidebarWidth: number

  constructor(private SessionService: SessionService,
              private OpenstreetmapService: OpenstreetmapService) {
    (Mapboxgl as any).accessToken = environment.mapbox.token

    this.sidebarWidth_sub = this.SessionService.sidebarWidth.subscribe((w: number) => {
      this.sidebarWidth = w
    })
  }

  buildMap() {
    this.map = new Mapboxgl.Map({
      container: 'mapbox', // container id
      style: 'mapbox://styles/travelnet/ck99afyp80hhu1iqrodjf1brl',
      center: [-71.22, 46.85], // starting position
      zoom: 2, // starting zoom
      failIfMajorPerformanceCaveat:true, //map creation will fail
      //if the performance of Mapbox GL JS
      pitchWithRotate: false,
      dragRotate:false,
    });
    // this._clickLocation = new BehaviorSubject(`${this.map.getCenter().lng},${this.map.getCenter().lat}`)
    // this.clickLocation = this._clickLocation.asObservable()

    this.map.on('load', () => {
      // init center observable 
      this.getCenter()
      this.getFakeCenter()

      this.map.on('click',(e)=>{
        let lng = e.lngLat.lng
        let lat = e.lngLat.lat
        this._clickLocation.next({
          lng: lng,
          lat: lat
        })
      })
    })

    // update fake center of map
    this.map
    .on('zoomend',()=>{
      this.getFakeCenter()
    })
    .on('moveend',()=>{
      this.getFakeCenter()
    })

  }

  addGeoJsonSource(id: string, type: any, content: any[]) {
    this.map.addSource(id, {
      'type': 'geojson',
      'data': {
        'type': type,
        'features': content
      }
    })
  }

  addLayer(id: string, type: any, source: string, layout?: {[key: string]: any}, paint?: {[key: string]: any}) {
    this.map.addLayer({
      'id': id,
      'type': type,
      'source': source,
      'layout': layout,
      'paint': paint
    })
  }

  addMarker(location: {[key: string]: any}) {
    let coord: mapboxgl.LngLatLike = {
      lng: location.lng,
      lat: location.lat
    }
    this.venueLocation = new Mapboxgl.Marker()
    .setLngLat(coord)
    .addTo(this.map);
    coord.lng -= this.lngOffset
    this.map.flyTo({ 'center': coord, 'speed': 0.8, 'curve': 1, 'essential': true });
  }

  /** gets middle point between sidebar and right side of screen */
  getFakeCenter(sidebar: number = this.sidebarWidth) {
    let centerPoints: any
    if (sidebar < 500) {
      centerPoints = this.map.unproject([window.innerWidth/2, window.innerHeight/2])
    }
    else {
      centerPoints = this.map.unproject([(window.innerWidth - sidebar)/2 + sidebar, window.innerHeight/2])
    }
    let realCenter: mapboxgl.LngLatLike = this.map.getCenter()
    centerPoints = new CustomCoordinates(centerPoints.lng, centerPoints.lat)
    this.lngOffset = centerPoints.lng - realCenter.lng
    // update coord at fake center
    this._fakeCenter.next(centerPoints)

    if (this.citySearchPresent) {
      // get name of city at fake center
      this.OpenstreetmapService.reverseSearch(centerPoints.lng, centerPoints.lat)
      .subscribe((response) => {
        this._fakeCenterCity.next(response)
      }, err => {
        console.log(err)
        this._fakeCenterCity.next(err)
      })      
    }
  }

  /** return coordinates [lng, lat] at center of screen if not found -> montreal*/
  getCenter(): CustomCoordinates {
    let lng: number = this.map.getCenter().lng? this.map.getCenter().lng : environment.montrealCoord.lng
    let lat: number = this.map.getCenter().lat? this.map.getCenter().lat : environment.montrealCoord.lat
    return new CustomCoordinates(lng, lat)
  }

  /** highlight selected coutries when register */
  showMarker(target: number, input?: geocodeResponseModel, style?: URL) {
    if (!input && this.map.getSource('points') && this.Places[target - 1]) {
      (this.map.getSource('points') as Mapboxgl.GeoJSONSource).setData(
        {
          'type': 'FeatureCollection',
          'features': this.Places[target - 1] as any
        }
      )
    } else if (input) {
      this.Places[target - 1].push(new featureGEOJSONModel(input.name, input.content.geometry.coordinates))
      let coord: mapboxgl.LngLatLike = {
        lng: input.content.geometry.coordinates[0],
        lat: input.content.geometry.coordinates[1]
      }
      coord.lng -= this.lngOffset
      this.map.flyTo({ 'center': coord, 'speed': 0.8, 'curve': 1, 'essential': true });
      if (this.map.getSource('points')) {
        // update points
        (this.map.getSource('points') as Mapboxgl.GeoJSONSource).setData(
          {
            'type': 'FeatureCollection',
            'features': this.Places[target - 1] as any
          }
        )
      } else {
        // add first point
        this.map.addSource('points', {
          'type': 'geojson',
          'data': {
            'type': 'FeatureCollection',
            'features': [
              {
                'type': 'Feature',
                'geometry': {
                  'type': 'Point',
                  'coordinates': [
                    input.content.geometry.coordinates[0],
                    input.content.geometry.coordinates[1],
                  ]
                },
                'properties': {
                  'title': input.name,
                  'marker-color': '#3c4e5a',
                  'marker-symbol': 'marker-15',
                  'marker-size': 'large',
                }
              },
            ]
          }
        });

      }
    }
    if (!this.map.getLayer('points') && this.map.getSource('points')) {
      this.map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
          // get the icon name from the source's "icon" property
          // concatenate the name to get an icon from the style's sprite sheet
          'icon-image': ['get', 'marker-symbol'],
          // get the title name from the source's "title" property
          'text-field': ['get', 'title'],
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        }
      });
    }
  }

  // remove markers on map
  removeMarker(name: string, target: number, all?: boolean) {
    if (all) {
      this.Places[target - 1] = []
      if(this.map.getSource('points')) {
        (this.map.getSource('points') as Mapboxgl.GeoJSONSource).setData(
          {
            'type': 'FeatureCollection',
            'features': []
          }
        )
      }
    } else {
      for (let x = 0; x < this.Places[target - 1].length; x++) {
        if (this.Places[target - 1][x].properties.title == name) {
          this.Places[target - 1].splice(x, 1) as any
          (this.map.getSource('points') as Mapboxgl.GeoJSONSource).setData(
            {
              'type': 'FeatureCollection',
              'features': this.Places[target - 1] as any
            }
          )
          break
        }
      }
    }
  }

  venueOnDestroy() {
    if (this.venueLocation) {
      this.venueLocation.remove()
    }
  }
  ngOnDestroy() {
    this.sidebarWidth_sub.unsubscribe()
  }
}