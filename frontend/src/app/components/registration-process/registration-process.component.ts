import { Router } from '@angular/router';
import { RegistrationComponent } from './registrationpage/registrationpage.component';
import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-registration-process',
  templateUrl: './registration-process.component.html',
  styleUrls: ['./registration-process.component.scss']
})
export class RegistrationProcessComponent implements OnInit, AfterViewInit, OnDestroy {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  @ViewChild('step1') step1
  @ViewChild('registration') registration: RegistrationComponent

  constructor(private _formBuilder: FormBuilder,
              private Router: Router) { }

  ngOnInit(): void {
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ''
    });
  }

  ngAfterViewInit() {
    this.step1.stepControl = this.registration.registrationForm
  }

  registerClicked() {
    this.registration.onSubmit()
  }

  ngOnDestroy() {
    // this.Router.navigate(['/'])
  }

}
