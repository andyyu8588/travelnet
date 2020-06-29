import { Subscription } from 'rxjs';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { SocketService } from '../../../services/chatsystem/socket.service';
import { Component, OnDestroy, OnInit, Input, ViewChild} from '@angular/core';
import { SessionService } from '../../../services/session.service'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, Form } from '@angular/forms'
import * as moment from 'moment';


@Component({
    selector: 'app-registration',
    templateUrl:'./registration.component.html',
    styleUrls: ['./registrationpage.component.scss'],
})

export class registrationComponent {
    modal:any
    constructor(private modalService:NgbModal, private SessionService:SessionService) {
      this.openModal()
    }
    openModal() {
        this.modal = this.modalService.open(RegistrationComponent,{})
    }
}


@Component({
    selector: 'app-registrationpage',
    templateUrl:'./registrationpage.component.html',
    styleUrls: ['./registrationpage.component.scss'],
    providers:[NgbModalConfig,NgbModal,]
})

export class RegistrationComponent implements OnDestroy, OnInit {
  sessionState_sub: Subscription
  sessionState: Boolean
  registrationForm:FormGroup;
  hide = true;
  hide1 = true;
  currentTime: string = new Date().toISOString()
  @Input() stepper: MatHorizontalStepper

  constructor(private SocketService: SocketService,
              private sessionService:SessionService,
              private modalService:NgbModal,
              private router:Router,) {

  }

  ngOnInit(){
    this.registrationForm = new FormGroup({
      'name': new FormGroup({
        'firstName': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
        'lastName': new FormControl(null, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]),
      },),
      'passwords': new FormGroup({
        'password': new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(15)]),
        'confirmPassword': new FormControl(null, [Validators.required, Validators.minLength(5), Validators.maxLength(15)]),
      }, this.checkPasswordsMatch.bind(this)),
      'birthDate':new FormControl(null, [Validators.required]),
      'username': new FormControl(null,[ Validators.required, Validators.minLength(2), Validators.maxLength(15)], this.forbiddenUsernames.bind(this)),
      'email': new FormControl(null, [Validators.required, Validators.email]),
      'checkbox': new FormControl(null, [Validators.required]),
      'gender':new FormControl(null, [Validators.required]),
    })

    this.sessionState_sub = this.sessionService.sessionState.subscribe((state: boolean) => {
      this.sessionState = state
    })
  }

  checkUsernameUse() {
    if (this.registrationForm.get('username').errors && this.registrationForm.get('username').dirty){
      if (this.registrationForm.get('username').errors['forbiddenUsername']){
        return true
      }
    } else {
        return false
      }
  }

  checkUsernameLength() {
    if (this.registrationForm.get('username').errors && this.registrationForm.get('username').dirty){
      if (this.registrationForm.get('username').errors['maxlength'] || this.registrationForm.get('username').errors['minlength']){
        return true
      }
    } else {
        return false
      }
  }

  checkPasswordValidity: boolean = false
  checkPasswordsMatch(control: FormControl) {
    if (this.registrationForm) {
      let pass: string = control.get('password').value
      let confirm: string = control.get('confirmPassword').value
      if (pass === confirm) {
        this.checkPasswordValidity = false
        return
      } else {
        if(control.get('confirmPassword').dirty) {
          this.checkPasswordValidity = true
        }
        return
      }
    }
  }

  checkPasswordLength() {
    if (this.registrationForm.get('passwords.password').errors && this.registrationForm.get('passwords.password').dirty){
      if (this.registrationForm.get('passwords.password').errors['maxlength'] || this.registrationForm.get('passwords.password').errors['minlength']){
        return true
      }
    }
  }

  checkEmailValidity() {
    if (this.registrationForm.get('email').errors && this.registrationForm.get('email').dirty){
      if (this.registrationForm.get('email').errors['email']){
        return true
      }
    }
  }

  // check if user is older than 13
  isOld(){
    let birth = this.registrationForm.get('birthDate').value
    let now = moment(this.currentTime)
    let difference = now.diff(birth, 'years')
    if (difference < 13){
      return false
    }
    else{
      return true
    }
  }

  forbiddenUsernames(control: FormControl): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.SocketService.emit('searchUser', [control.value], (res) => {
        if (res.res) {
          resolve({'forbiddenUsername': true});
        } else {
          resolve(null)
        }
      })
    })
  }

  onSubmit()  {
    // check age
    if (this.isOld()) {
      // check form validity && if logged in
      if (this.registrationForm.valid && !(sessionStorage.getItem('username'))) {
        let data = {
          firstName:this.registrationForm.get('name.firstName').value,
          lastName:this.registrationForm.get('name.lastName').value,
          email:this.registrationForm.get('email').value,
          username:this.registrationForm.get('username').value,
          password:this.registrationForm.get('passwords.password').value,
          gender:this.registrationForm.get('gender').value,
          birthdate:this.registrationForm.get('birthDate').value
        }
        this.SocketService.emit('createUser',data, (res) => {
          // error in backend
          if (res.err) {
            alert(`an error occured ${res.err}`)
          }
          // successfull
          else if (res.user) {
            sessionStorage.setItem('username', res.user.username)
            localStorage.setItem('token', res.token)
            localStorage.setItem('username', res.user.username)
            this.sessionService.session()
            this.modalService.dismissAll()
            this.stepper.next()
            console.log(`user created: ${sessionStorage.getItem('username')}`)
          }
        })
      } 
    }
    // not old enough
    else {
      alert('You must be at least 13 years old to register')
      window.location.reload()
    }
  }

  ngOnDestroy(){
    // this.router.navigate(['/'])
    this.sessionState_sub.unsubscribe()
  }

}

