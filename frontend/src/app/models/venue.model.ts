export class venueModel {//will probably be changed with premium
    public id: string
    public name: string
    public contact: {[key: string]: any}
    public location: {
        [key: string]: any
        adress?: any
    }
    public categories: any[]
    public verified: boolean
    public stats: {
        [key: string]: any
        checkinsCount?: any
        usersCount?: any
    }
    public url: any
    public hours: any
    public rating: any
    public description: any
    public photos: any
    public likes: any
}
/*  'type':'venue',
    'name' : venue.venue.name,
    'address' : venue.venue.location,
    'formattedAddress' : venue.venue.formattedAddress,
    'category' : (venue.venue.categories)[0].name,
    'reasons' : (venue.reasons.items)[0].summary,
    'Id' : venue.venue.id,
    */
