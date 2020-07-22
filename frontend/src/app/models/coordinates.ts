export class CustomCoordinates {
    lng: number
    lat: number

    /** 1: lng,lat | 2: lat,lng */
    toStringReorder(order: number): string {
        if (order === 1) {
            return `${this.lng},${this.lat}`
        } else {
            return `${this.lat},${this.lng}`
        }
    }

    constructor(lng: number, lat: number) {
        this.lng = lng
        this.lat = lat
    }

}