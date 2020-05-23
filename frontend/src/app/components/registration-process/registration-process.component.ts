import { RegistrationComponent } from './registrationpage/registrationpage.component';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-registration-process',
  templateUrl: './registration-process.component.html',
  styleUrls: ['./registration-process.component.scss']
})
export class RegistrationProcessComponent implements OnInit, AfterViewInit {
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  @ViewChild('step1') step1
  @ViewChild('registration') registration: RegistrationComponent

  constructor(private _formBuilder: FormBuilder) { }

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

}
