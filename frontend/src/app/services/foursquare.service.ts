import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class foursquareService {
  constructor(private http: HttpClient) {}

CLIENT_ID = 'NYZJ324E5GAY2MSQUNYIYLKIDCMX2ETMQREKQXZLW3S5ZYVG';
CLIENT_SECRET = 'K51P2Y1T3TMTCU24LOFHDFOAONPGU44ZBNZCGTWCOJESUW4A';
URL = 'https://api.foursquare.com/v2/venues/search'
lol = 'https://api.foursquare.com/v2/venues/search?client_id=NYZJ324E5GAY2MSQUNYIYLKIDCMX2ETMQREKQXZLW3S5ZYVG&client_secret=K51P2Y1T3TMTCU24LOFHDFOAONPGU44ZBNZCGTWCOJESUW4A&v=20190425&ll=40.7099,-73.9622&intent=checkin&radius=200&query=peter%20luger%20steakhouse'

// headers: new HttpHeaders({

    // })
    // {}})


    onSendRequest(){
      return this.http
        .get<{[key: string]: any}>(
          'https://api.foursquare.com/v2/venues/search',
          {
            headers: {
             
            },
            params: {
              'client_id': this.CLIENT_ID,
              'client_secret': this.CLIENT_SECRET,
              'v': '20200513',
              'll': '40.7099,-73.9622',
            }
          }
        )
        .subscribe(response => {
          console.log(response.response)
        })
  }
}
