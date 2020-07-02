import { SessionService } from 'src/app/services/session.service';
import { Subscription, BehaviorSubject, Observable } from 'rxjs';
import { MapService, clickLocationCoordinates } from './../../services/map/map.service';
import { Router } from '@angular/router';
import { RegistrationComponent } from './registrationpage/registrationpage.component';
import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, Output, Input } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatHorizontalStepper } from '@angular/material/stepper';

export interface progressUpdateData {
  target: number
  coordinates: number[]
}

@Component({
  selector: 'app-registration-process',
  templateUrl: './registration-process.component.html',
  styleUrls: ['./registration-process.component.scss']
})
export class RegistrationProcessComponent implements OnInit, AfterViewInit, OnDestroy {
  private sessionState_sub: Subscription
  sessionState: Boolean

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  @ViewChild('stepper') stepper: MatHorizontalStepper
  @ViewChild('step1') step1: any
  editable: Boolean = true
  @ViewChild('registration') registration: RegistrationComponent

  private _progressUpdate: BehaviorSubject<progressUpdateData> = new BehaviorSubject({
    target: 0,
    coordinates: []
  })
  @ViewChild('progressUpdate') progressUpdate: Observable<progressUpdateData> = this._progressUpdate.asObservable()

  private clickLocation: Subscription
  private stepper_sub: Subscription

  constructor(private _formBuilder: FormBuilder,
              private MapService: MapService,
              private  SessionService: SessionService) { }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ''
    });
    this.sessionState_sub = this.SessionService.sessionState.subscribe((state: Boolean) => {
      this.sessionState = state
    })
  } 

  ngAfterViewInit() {
    // this.step1.stepControl = this.registration.registrationForm
    this.clickLocation = this.MapService.clickLocation.subscribe((x: clickLocationCoordinates) => {
      this._progressUpdate.next({
        target: this.stepper._getFocusIndex(),
        coordinates: [x.lng, x.lat]
      })
    })
    this.stepper_sub = this.stepper.selectionChange.subscribe(x => {
      if (x.selectedIndex != 0) {
        this.editable = false
        this.MapService.showMarker(x.selectedIndex)
      }
    })
  }

  registerClicked() {
    this.registration.onSubmit()
  }

  onClear(target: number) {

  }

  ngOnDestroy() {
    // this.Router.navigate(['/'])
    this.clickLocation.unsubscribe()
    this.stepper_sub.unsubscribe()
    this.sessionState_sub.unsubscribe()
  }

}
