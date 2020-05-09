import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {
  @Input() email: string
  @Input() username: string

  constructor() { }

  ngOnInit(): void {
  }

}
