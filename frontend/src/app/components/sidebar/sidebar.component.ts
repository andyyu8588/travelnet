import { ResizableModule } from 'angular-resizable-element';
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

  ngOnDestroy() {
    this.windowSub.unsubscribe()
  }

}
