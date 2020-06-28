import { MapService } from 'src/app/services/map/map.service';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';
import { Router } from '@angular/router';
import { Component, Output, EventEmitter, ViewChild, ElementRef, Renderer2, OnDestroy, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/session.service'


@Component({
    selector: 'header-navbar',
    templateUrl:'./header.component.html',
    styleUrls: ['./header.component.scss'],
})

export class HeaderComponent implements OnDestroy, OnInit{
    sessionState: any
    username: string
    link: string = 'data:image/jpeg;base64,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'
    @Output() featureSelected = new EventEmitter<string>();
    @ViewChild('searchResultsContainer') div: ElementRef
    loading: boolean = false
    search: any
    private child: HTMLParagraphElement

    private mapCenterSub: Subscription
    mapCenter: string

    private sessionState_sub: Subscription

    constructor(private sessionService:SessionService,
                private Renderer : Renderer2,
                private SearchService: SearchService,
                private map: MapService,
                private router: Router) {
        this.sessionState_sub = this.sessionService.sessionState.subscribe((username) => {
            this.sessionState = username
            if (username) {
                this.username = sessionStorage.getItem('username')
            } else {
                this.username = ''
            }
        })
    }

    ngOnInit() {
        // this.mapCenterSub = this.MapService.clickLocation.subscribe(x => {
        //     this.mapCenter = x
        // })
    }

    onKey(data: string) {
        if (data === "") {
            this.loading = false
        } else {
            this.loading = true
            // this.SearchService.foursquareSearch(data,this.map.getCenter())
            this.SearchService.mainSearch(data, this.map.getCenter())
            .then((finalData) => {
                this.loading = false
                this.Renderer.removeChild(this.div, this.child)
                this.child = this.Renderer.createElement('p');
                this.child.innerHTML = finalData[1]
                this.Renderer.appendChild(this.div.nativeElement, this.child)
            })
            .catch((err) => {
                this.loading = false
            })
        }
    }

    onReload() {
        this.router.navigate(['home']).then(() => {
            window.location.reload()
        })
    }

    onSubmit(data: string) {
        // this.SearchService.newSeach(data, this.map.getCenter())
    }

    ngOnDestroy() {
        this.mapCenterSub.unsubscribe()
        this.sessionState_sub.unsubscribe()
    }
}


// onKey(data: string) {
//     if (data === "") {
//         this.loading = false
//     } else {
//         this.loading = true
//         this.SocketService.emit('searchChatroom', {req: [data]}, (ack) => {
//             console.log(ack)
//             // this.Renderer.removeChild(this.div, this.div)
//             if (ack.err) {
//                 this.loading = false
//                 this.Renderer.removeChild(this.div, this.child)
//                 this.child = this.Renderer.createElement('p');
//                 this.child.innerHTML = ack.err
//                 this.Renderer.appendChild(this.div.nativeElement, this.child)
//             } else {
//                 this.loading = false
//                 this.Renderer.removeChild(this.div, this.child)
//                 this.child = this.Renderer.createElement('p');
//                 this.child.innerHTML = ack.res
//                 this.Renderer.appendChild(this.div.nativeElement, this.child)
//             }
//         })
//     }
// }
