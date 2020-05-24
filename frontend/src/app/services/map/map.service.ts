import { BehaviorSubject, Observable } from 'rxjs';
import { Injectable, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { SearchService } from 'src/app/services/search.service'
import * as Mapboxgl from 'mapbox-gl'

@Injectable({
  providedIn: 'root'
})
export class MapService {
  map: Mapboxgl.Map

  private _clickLocation: BehaviorSubject<any> = new BehaviorSubject('')
  clickLocation: Observable<any> = this._clickLocation.asObservable()

  constructor() {
    Mapboxgl.accessToken = environment.mapbox

  }

  buildMap() {
    this.map = new Mapboxgl.Map({
      container: 'mapbox', // container id
      style: 'mapbox://styles/travelnet/ck99afyp80hhu1iqrodjf1brl',
      center: [-71.22, 46.85], // starting position
      zoom: 2, // starting zoom
      failIfMajorPerformanceCaveat:true, //map creation will fail
      //if the performance of Mapbox GL JS
    });
    // this._clickLocation = new BehaviorSubject(`${this.map.getCenter().lng},${this.map.getCenter().lat}`)
    // this.clickLocation = this._clickLocation.asObservable()

    this.map.on('load', () => {

      this.map.on('click',(e)=>{
        let lng = e.lngLat.lng
        let lat = e.lngLat.lat
        let latLng: string =  lat +','+ lng
        // console.log(latLng)
        this._clickLocation.next(`${lng}, ${lat}`)
      })

    })
  }

  getCenter(){
    return `${this.map.getCenter().lat},${this.map.getCenter().lng}`
  }

  // highlight selected coutries when register
  highlightCountry(coord: any) {
    console.log(coord)
    this.map.addSource('points', {
      'type': 'geojson',
      'data': {
      'type': 'FeatureCollection',
      'features': [
        {
          // feature for Mapbox DC
          'type': 'Feature',
          'geometry': {
          'type': 'Point',
          'coordinates': [
            -77.03238901390978,
            38.913188059745586
          ]
          },
          'properties': {
            'title': 'Mapbox DC',
            'icon': 'monument'
          }
        },
      ]
      }
    });
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
