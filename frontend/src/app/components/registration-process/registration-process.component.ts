import { CountrySelectorComponent } from './country-selector/country-selector.component'
import { SessionService } from 'src/app/services/session.service'
import { Subscription, BehaviorSubject, Observable } from 'rxjs'
import { MapService, clickLocationCoordinates } from './../../services/map/map.service'
import { Router } from '@angular/router'
import { RegistrationComponent } from './registrationpage/registrationpage.component'
import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, Output, Input } from '@angular/core'
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms'
import { MatHorizontalStepper } from '@angular/material/stepper'

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

  firstFormGroup: FormGroup
  secondFormGroup: FormGroup
  @ViewChild('stepper') stepper: MatHorizontalStepper
  @ViewChild('step1') step1: any
  @ViewChild('selector1') selector1: CountrySelectorComponent
  @ViewChild('selector2') selector2: CountrySelectorComponent

  editable: Boolean = true
  @ViewChild('registration') registration: RegistrationComponent

  private _progressUpdate: BehaviorSubject<progressUpdateData> = new BehaviorSubject({
    target: 0,
    coordinates: []
  })
  @ViewChild('progressUpdate') progressUpdate: Observable<progressUpdateData> = this._progressUpdate.asObservable()

  private clickLocation: Subscription
  private stepper_sub: Subscription

  isSaving = false
  isDone = false

  constructor(private _formBuilder: FormBuilder,
              private MapService: MapService,
              private SessionService: SessionService,
              private Router: Router) { }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['']
    })
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ''
    })
    this.sessionState_sub = this.SessionService.sessionState.subscribe((state: Boolean) => {
      this.sessionState = state
    })
  }

  ngAfterViewInit() { // setup registration form
    this.step1.stepControl = this.registration.registrationForm
    this.clickLocation = this.MapService.clickLocation.subscribe((x: clickLocationCoordinates) => {
      this._progressUpdate.next({
        target: this.stepper.selectedIndex,
        coordinates: [x.lng, x.lat]
      })
    })
    this.stepper_sub = this.stepper.selectionChange.subscribe(x => {
      console.log(this.stepper.steps)
      if (x.selectedIndex != 0) {
        this.editable = false
        this.isDone = false
        this.MapService.showMarker(x.selectedIndex)
      }
    })
  }

  registerClicked() {
    this.registration.onSubmit()
  }

  onClear(target: number) {

  }

  savePreferences() {
    this.isSaving = true
    Promise.all([this.selector1.onSumbit(), this.selector2.onSumbit()])
    .then((responses: any[]) => {
      this.isDone = true
      setTimeout(() => {
        this.Router.navigate(['/home'])
      }, 500)
    })
    .catch((err: any[]) => {
      alert(err[0])
      // window.location.reload()
    })
    .finally(() => {
      this.isSaving = false
    })

  }

  ngOnDestroy() {
    // this.Router.navigate(['/'])
    this.clickLocation.unsubscribe()
    this.stepper_sub.unsubscribe()
    this.sessionState_sub.unsubscribe()
  }

}
