// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  travelnetURL: 'https://travelnet.herokuapp.com',

  mapbox: {
    token: 'pk.eyJ1IjoidHJhdmVsbmV0IiwiYSI6ImNrOTk3cHkwaDAzaHkzZHEwMm03ZGN0MG8ifQ.j24u0Q5RbYw7PW4tVpGjmQ',
    geocoding: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
  },

  foursquare: {
    clientId: 'NYZJ324E5GAY2MSQUNYIYLKIDCMX2ETMQREKQXZLW3S5ZYVG',
    clientSecret: 'K51P2Y1T3TMTCU24LOFHDFOAONPGU44ZBNZCGTWCOJESUW4A',
    v: '20200517',
    venuesSearch: 'https://api.foursquare.com/v2/venues/search',
    venuesExplore: 'https://api.foursquare.com/v2/venues/explore'

  },

  nominatim: {
    search: 'https://nominatim.openstreetmap.org/search'
  },

  openstreetmap:{
    searchNodes:'https://master.apis.dev.openstreetmap.org/api/0.6/map',
    searchRealNode:' https://api.openstreetmap.org/api/0.6/map'
  },

  travelnet: {
    getUserInfo: 'https://travelnet.herokuapp.com/user',
    getProfile: 'https://travelnet.herokuapp.com/profile',
    searchUsers:'https://travelnet.herokuapp.com/searchusers',
  },



};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
