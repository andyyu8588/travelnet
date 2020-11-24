import { interval as observableInterval } from 'rxjs'
import { takeWhile, scan, tap } from 'rxjs/operators'
import { Component, OnInit, Input } from '@angular/core'

@Component({
  selector: 'app-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss']
})
export class ScrollToTopComponent implements OnInit {
  @Input() el

  constructor() { }

  ngOnInit(): void {
  }

  scrollToTop() {
    const duration = 500
    const interval = 40
    const move = this.el.scrollTop * interval / duration
    observableInterval(interval)
    .pipe(
      scan((acc, curr) => acc - move, this.el.scrollTop),
      tap(position => this.el.scrollTop = position),
      takeWhile(val => val > 0)
    )
    .subscribe()
  }

}
