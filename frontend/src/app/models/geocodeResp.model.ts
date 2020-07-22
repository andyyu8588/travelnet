import { environment } from 'src/environments/environment';
/** response from openstreetmaps api /search, coord as [lng, lat] */
export class geocodeResponseModel {
    [key: string]: any
    name: string
    content: {
        [key: string]: any
        geometry: {
            [key: string]: any
            coordinates: number[]
        } 
    }

    constructor(name: string, coord: number[], content?: {[key: string]: any, geometry: any}) {
        this.name = name
        this.content = {
            geometry: {
                coordinates: [environment.montrealCoord.lng, environment.montrealCoord.lat]
            }
        }
        if (content) {
            console.log(content)
            this.content = content
        } else {
            this.content.geometry.coordinates = coord
        }
    }
}