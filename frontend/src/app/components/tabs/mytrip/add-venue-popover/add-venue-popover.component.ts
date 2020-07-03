import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CitySearchComponent } from './../../../city-search/city-search.component';
import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, Input } from '@angular/core';

@Component({
  selector: 'app-add-venue-popover',
  templateUrl: './add-venue-popover.component.html',
  styleUrls: ['./add-venue-popover.component.scss']
})
export class AddVenuePopoverComponent implements OnInit, AfterViewInit, OnDestroy {
  // passed by mytrip
  @Input() tripIndex: number
  @Input() dayIndex: number

  @ViewChild('citySearch') CitySearchComponent: CitySearchComponent
  private selectedOption_sub: Subscription
  citySearchAppearance: string = 'outline'
  citySearchPlaceholder: string = 'Search for a City'

  customVenueForm: FormGroup 

  constructor() { }

  ngOnInit(): void {
    this.customVenueForm = new FormGroup({
      'name': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(25)])
    })
  }

  ngAfterViewInit() {
   this.selectedOption_sub = this.CitySearchComponent.clickedOption.subscribe((location) => {
    if (location.name) {
      this.CitySearchComponent.value = location.name
    }

   })
  }

  ngOnDestroy() {
    this.selectedOption_sub.unsubscribe()
  }
}
