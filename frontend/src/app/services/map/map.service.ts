import { CustomCoordinates } from './../../models/coordinates';
import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable, OnInit, Input, OnDestroy } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SearchService } from 'src/app/services/search.service'
import * as Mapboxgl from 'mapbox-gl'

export class featureGEOJSONModel {
  public type: String
  public geometry: {
    type: String,
    coordinates: number[]
  }
  public properties?: {
    title: string,
    icon: string
  }

  constructor(title: string, coordinates: number[]) {
    this.type = 'Feature'
    this.geometry = {
      'type': 'Point',
      'coordinates': coordinates
    }
    this.properties = {
      title: title,
      icon: 'monument'
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
  private _fakeCenter: BehaviorSubject<CustomCoordinates> = new BehaviorSubject(null)
  public fakeCenter : Observable<CustomCoordinates> = this._fakeCenter.asObservable()

  map: Mapboxgl.Map
  venueLocation: Mapboxgl.marker

  private _clickLocation: BehaviorSubject<clickLocationCoordinates> = new BehaviorSubject({
    lat: null,
    lng: null
  })
  clickLocation: Observable<clickLocationCoordinates> = this._clickLocation.asObservable()

  private Places: Array<featureGEOJSONModel[]> = [[],[]]

  constructor() {
    Mapboxgl.accessToken = environment.mapbox.token
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
    this.map.on('touchend',()=>{
      this.getFakeCenter()
    })
    this.map.on('zoomend',()=>{
      this.getFakeCenter()
    })
    this.map.on('moveend',()=>{
      this.getFakeCenter()
    })

  }

  addGeoJsonSource(id: string, type: string, content: featureGEOJSONModel[]) {
    this.map.addSource(id, {
      'type': 'geojson',
      'data': {
        'type': type,
        'features': content
      }
    })
  }

  addLayer(id: string, type: string, source: string, layout?: {[key: string]: any}, paint?: {[key: string]: any}) {
    this.map.addLayer({
      'id': id,
      'type': type,
      'source': source,
      'layout': layout,
      'paint': paint
    })
  }

  addMarker(location: {[key: string]: any}) {
    let coord: number[] = [location.lng, location.lat]
    this.venueLocation = new Mapboxgl.Marker()
    .setLngLat(coord)
    .addTo(this.map);
    // this.map.flyTo({ 'center': coord, 'zoom': 8, 'speed': 0.8, 'curve': 1, 'essential': true });
  }

  /** gets middle point between sidebar and right side of screen */
  getFakeCenter(sidebar: number = window.innerWidth*.4) {
    let centerPoints: any
    if (sidebar === -1) {
      centerPoints = this.map.unproject([window.innerWidth/2 + this.map.project(this.fakeCenter)[0], window.innerHeight/2])
    }
    else if (sidebar < 500) {
      centerPoints = this.map.unproject([window.innerWidth/2, window.innerHeight/2])
    }
    else {
      centerPoints = this.map.unproject([(window.innerWidth - sidebar)/2 + sidebar, window.innerHeight/2])
    }
    this._fakeCenter.next(new CustomCoordinates(centerPoints.lng, centerPoints.lat))
  }

  /** return coordinates [lng, lat] at center of screen */
  // if not found -> montreal
  getCenter(): CustomCoordinates {
    let lng: number = this.map.getCenter().lng? this.map.getCenter().lng : 73.5673 
    let lat: number = this.map.getCenter().lat? this.map.getCenter().lat : 45.5017
    return new CustomCoordinates(lng, lat)
  }

  // highlight selected coutries when register
  showMarker(target: number, input?: {[key: string]: any}) {
    if (!input && this.map.getSource('points') && this.Places[target - 1]) {
      this.map.getSource('points').setData(
        {
          'type': 'FeatureCollection',
          'features': this.Places[target - 1]
        }
      )
    } else if (input) {
      this.Places[target - 1].push(new featureGEOJSONModel(input.name, input.content.geometry.coordinates))
      this.map.flyTo({ 'center': input.content.geometry.coordinates, 'zoom': 4, 'speed': 0.8, 'curve': 1, 'essential': true });
      if (this.map.getSource('points')) {
        // update points
        this.map.getSource('points').setData(
          {
            'type': 'FeatureCollection',
            'features': this.Places[target - 1]
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
                  'icon': 'monument'
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
          'icon-image': ['concat', ['get', 'icon'], '-15'],
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
        this.map.getSource('points').setData(
          {
            'type': 'FeatureCollection',
            'features': []
          }
        )
      }
    } else {
      for (let x = 0; x < this.Places[target - 1].length; x++) {
        if (this.Places[target - 1][x].properties.title == name) {
          this.Places[target - 1].splice(x, 1)
          this.map.getSource('points').setData(
            {
              'type': 'FeatureCollection',
              'features': this.Places[target - 1]
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
    this._fakeCenter.unsubscribe()

  }
}

      // add areas ** gotta complete the polygon
      // this.addGeoJsonSource(input.name, 'Feature', [{
      //   'type': 'Polygon',
      //   'geometry': {
      //     'type': 'Point',
      //     'coordinates': [input.content.bbox]
      //   }
      // }])
      // this.addLayer(input.name, 'fill', input.name, {}, {
      //     'fill-color': '#088',
      //     'fill-opacity': 0.8
      //   } )
