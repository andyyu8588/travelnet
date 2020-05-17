import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root'
})

export class FoursquareService {
  constructor(private http: HttpClient) {}

CLIENT_ID = 'NYZJ324E5GAY2MSQUNYIYLKIDCMX2ETMQREKQXZLW3S5ZYVG';
CLIENT_SECRET = 'K51P2Y1T3TMTCU24LOFHDFOAONPGU44ZBNZCGTWCOJESUW4A';
v = '20200516'

  onSendRequest(lngLag){
    return this.http
      .get<{[key: string]: any}>(
        environment.foursquare.venuesSearch,
        {
          headers: {
          },
          params: {
            'client_id': this.CLIENT_ID,
            'client_secret': this.CLIENT_SECRET,
            'v': this.v,
            'll': lngLag,
          }
      })
  }
}
