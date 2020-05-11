import { ResizableModule, ResizeEvent } from 'angular-resizable-element';
import { Subscription } from 'rxjs';
import { FriendlistService } from 'src/app/services/friendlist.service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  windowSub: Subscription
  window: boolean
  items: Array<any> = ['Home', 'Discover','My Trip']
  width: number = 30
  Styles = {
    'top': '10%',
    'bottom': '0%',
    'left': '2%',
    'width': '30%'
  }
  

  constructor(private FriendlistService: FriendlistService,
              private ResizableModule: ResizableModule) { 

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
