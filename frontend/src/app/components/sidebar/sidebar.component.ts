import { SessionService } from 'src/app/services/session.service'
import { Router } from '@angular/router'
import { tab } from '../../models/tab.model'
import { ResizeEvent } from 'angular-resizable-element'
import { Subscription } from 'rxjs'
import { FriendlistService } from 'src/app/services/chatsystem/friendlist.service'
import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core'
import { trigger, state, style, animate, transition, } from '@angular/animations'
import { MapService } from 'src/app/services/map/map.service'

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy, AfterViewInit {
  // about sidebar
  private windowSub: Subscription
  window = true
  width = 0.4
  Styles = {
    position: 'fixed',
    'background-color': 'rgba(255,255,255,0.75)',
    'min-width': '710px',
    top: '1%',
    left: '1%',
    height: '95%',
    'max-height': '95%',
    overflow: 'hidden',
    padding: '0',
    width: `${window.innerWidth >= 500 ? window.innerWidth * this.width : window.innerWidth}px`,
  }
  showFiller = true
  @ViewChild('drawer') drawer

  // about sidebar tabs
  private openTabSub: Subscription
  openTab: tab

  tabs: any[] = ['home', 'mytrip', 'search']

  selectedTab(): string {
    if (this.Router.url.substr(0, 7) == '/search') {
      return '/search'
    } else {
      return this.Router.url
    }
  }

  constructor(private FriendlistService: FriendlistService,
              private Router: Router,
              private MapService: MapService,
              private SessionService: SessionService
              )
  {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() { // setup friendlist
    this.windowSub = this.FriendlistService.windowSize.subscribe((windowWidth) => {
      if (windowWidth <= this.drawer._width) {
        if (windowWidth < 500 || window.innerWidth) {
          this.window = false
        } else {
          this.Styles.width = `${windowWidth * 0.96}px`
        }
      } else {
        this.window = true
      }
    })
  }

  validate(event: ResizeEvent) {
    const MIN_DIMENSIONS_PX = 500
    const maxWidth: number = window.innerWidth * 0.96
    if (
      event.rectangle.width && // if defined
      event.rectangle.height && // if defined
      (event.rectangle.width < MIN_DIMENSIONS_PX ||
      event.rectangle.width > maxWidth)
    ) {
      return false
    } else {
      return true
    }
  }

  onResizeEnd(event: {edges: any, rectangle: {bottom: number, height: number, left: number, right: number, scrollLeft: number, scrollTop: number, top: number, width: number}}): void {
    this.Styles.width = `${event.rectangle.width}px`
    this.SessionService.updateSidebarWidth(event.rectangle.width)
    this.MapService.getFakeCenter()
  }

  ngOnDestroy() {
    this.windowSub.unsubscribe()
    this.openTabSub.unsubscribe()
  }
}

