import { ResizableModule, ResizeEvent } from 'angular-resizable-element';
import { Subscription } from 'rxjs';
import { FriendlistService } from 'src/app/services/friendlist.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, state, style, animate, transition, } from '@angular/animations'
import { foursquareService } from 'src/app/services/foursquare.service'
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  animations: [
    trigger('hamburguerX', [
      state('hamburguer', style({})),
      state('topX', style({
        transform: 'rotate(45deg)',
        transformOrigin: 'left',
        margin: '6px'
      })),
      state('hide', style({
        opacity: 0
      })),
      state('bottomX', style({
        transform: 'rotate(-45deg)',
        transformOrigin: 'left',
        margin: '6px'
      })),
      transition('* => *', [
        animate('0.2s')
      ]),
    ]),
  ],
})
export class SidebarComponent implements OnInit, OnDestroy {
  windowSub: Subscription
  window: boolean
  items: Array<any> = ['Home', 'Discover','My Trip']
  width: number = 30
  Styles = {
    'position': 'fixed',
    'background-color': 'rgba(255,255,255,0.7)',
    'top': '10%',
    'left': '2%',
    'height': '85%',
    'width': '30%'
  }
  showFiller = true;
 

  constructor(private FriendlistService: FriendlistService,
              private ResizableModule: ResizableModule,
              private foursquare: foursquareService
              ) {

  }
    
  ngOnInit(): void {
    this.windowSub = this.FriendlistService.windowSize.subscribe((x) => {
      if (x > 1000) {
        this.window = true
      } else {
        this.window = false
      }
    })
  }

  initFoursquare(){
    this.foursquare.onSendRequest()
  }

  validate(event: ResizeEvent) {
    const MIN_DIMENSIONS_PX: number = 500;
    const maxWidth: number = window.innerWidth * 0.96
    if (
      event.rectangle.width && // if defined
        event.rectangle.height && // if defined
          (event.rectangle.width < MIN_DIMENSIONS_PX ||
            event.rectangle.width > maxWidth)
    ) {
      return false;
    }
    return true;
  }

  onResizeEnd(event: any): void {
    console.log('Element was resized', event);
    this.Styles.width = `${event.rectangle.width}px`
  }

  ngOnDestroy() {
    this.windowSub.unsubscribe()
  }

}

// old animations
// isHamburguer = false;
// onClick() {
//   this.isHamburguer = !this.isHamburguer;
// }