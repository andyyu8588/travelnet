import { Component, OnInit, Output, Input } from '@angular/core';
import {ThemePalette} from '@angular/material/core';

export interface VisitedPlaces {
  continent: string;
  places: string[];
}

@Component({
  selector: 'app-country-selector',
  templateUrl: './country-selector.component.html',
  styleUrls: ['./country-selector.component.scss']
})
export class CountrySelectorComponent implements OnInit {
  @Input() direction: boolean
  allPlaces: VisitedPlaces[] = [
    {continent: 'America', places: ['Paris','London']},
    {continent: 'Europe', places: []},
    {continent: 'Asia', places: []},
    {continent: 'Africa', places: []},
    {continent: 'Oceania', places: []},
    {continent: 'Antarctica', places: []}
  ];

  constructor() { }
  
  ngOnInit(): void {
  }

}
