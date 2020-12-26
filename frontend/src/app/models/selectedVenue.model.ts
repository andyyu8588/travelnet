export class selectedVenueModel {
  [key: string]: any
  public id: string
  public name: string
  public contact: {
    formattedPhone: string;
    phone: string
  }
  public location: {
    address: string;
    cc: string;
    city: string;
    country: string;
    formattedAddress: [string];
    labeledLatLngs: [{
      label: string;
      lat: number;
      lng: string;
    }]
    lat: number;
    lng: number;
    state: string
  }
  public categories: [{
    icon: {
      prefix: string
      suffix: string
    }
    id: string;
    name: string;
    pluralName: string;
    shortName: string
  }]
  public verified: boolean
  public stats: object
  public url: string
  public hours: object
  public popular: object
  public menu: {
    anchor: string;
    label: string;
    mobileUrl: string;
    type: string;
    url: string
  }
  public price: object
  public rating: number
  public hereNow: object
  public storeId: string
  public description: string
  public createdAt: number
  public mayor: string
  public tips: {
    count: number;
    groups: {
      items: [{
        agreeCount: number;
        canonicalUrl: string;
        createdAt: number;
        disagreeCount: number;
        id: string;
        lang: string;
        likes: {
          count: number;
          groups: []
          summary: string;
        }
        logView: boolean;
        text: string;
        todo: {count: number}
        type: string;
        user: {
          firstName: string;
          id: string;
          lastName: string;
          photo: {
            prefix: string;
            suffix: string
          }
        }
      }
      ]
    }
  }
  public listed: object
  public beenHere: number
  public shortUrl: string
  public canonicalUrl: string
  public photos: {
    count: number;
    groups: [{
      type: string;
      name: string;
      count: number;
      items: [{
        id: string;
        createdAt: number;
        height: number;
        width: number;
        prefix: string;
        suffix: string;
        user: {
          id: number;
          firstName: string;
          lastName: string;
          photo: object
        }
        visibility: string
        source: {
          name: string;
          url: string;
        }

      }]

    }
    ]
  }
  public like: number
  public disilike: number
  public hasMenu: boolean
  public phrases: []
  public attributes: {
    groups: [{
      count: number;
      items: [{
        displayName: string;
        displayValue: string
      }];
      name: string;
      summary: string;
      type: string;
    }]
  }
  // roles
  public page: {
    pageInfo: {
      banner: string;
      description: string
      links: {}
    }
    user: {
      bio: string
      id: string;
      firstName: string;
      lists: {}
      photo: {}
      tip: {}

    }
  }
  public bestPhoto: {
    createdAt: number;
    height: number;
    id: string;
    prefix: string;
    suffix: string;
    visibility: string;
    width: number
  }
}
