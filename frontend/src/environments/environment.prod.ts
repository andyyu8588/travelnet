export const environment = {


  production: true,
  language: 'en',
  travelnetURL: 'https://travelnet.herokuapp.com',
  travelnetCommentURL: "http://localhost:3000/api/comments/",

  mapbox: {
    token: 'pk.eyJ1IjoidHJhdmVsbmV0IiwiYSI6ImNrOTk3cHkwaDAzaHkzZHEwMm03ZGN0MG8ifQ.j24u0Q5RbYw7PW4tVpGjmQ',
    geocoding: 'https://api.mapbox.com/geocoding/v5/mapbox.places'
  },

  foursquare: {
    clientId: 'NYZJ324E5GAY2MSQUNYIYLKIDCMX2ETMQREKQXZLW3S5ZYVG',
    clientSecret: 'K51P2Y1T3TMTCU24LOFHDFOAONPGU44ZBNZCGTWCOJESUW4A',
    v: '',
    venuesSearch: 'https://api.foursquare.com/v2/venues/search',
    venuesExplore: 'https://api.foursquare.com/v2/venues/explore',
    venueDetails: 'https://api.foursquare.com/v2/venues',
    userAuth: 'https://foursquare.com/oauth2/authenticate',
    getCategories: 'https://api.foursquare.com/v2/venues/categories',

  },

  nominatim: {
    search: 'https://nominatim.openstreetmap.org/search',
    reverse: 'https://nominatim.openstreetmap.org/reverse'
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
