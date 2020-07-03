import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-venue-popover',
  templateUrl: './add-venue-popover.component.html',
  styleUrls: ['./add-venue-popover.component.scss']
})
export class AddVenuePopoverComponent implements OnInit {
  citySearchAppearance: string = 'outline'
  citySearchPlaceholder: string = 'Search for a City'

  constructor() { }

  ngOnInit(): void {
  }

}
