import { SocketService } from '../../services/socket.service';
import { Component, OnDestroy, OnInit} from '@angular/core';
import { SessionService } from '../../services/session.service'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms'
import {NgbDateStruct} from '@ng-bootstrap/ng-bootstrap'



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
    providers:[NgbModalConfig,NgbModal]
})

export class RegistrationComponent implements OnDestroy, OnInit {
  registrationForm:FormGroup;
  hide = true;
  hide1 = true;
  model: NgbDateStruct;

  constructor(private SocketService: SocketService,
              private sessionService:SessionService,
              private modalService:NgbModal,
              private router:Router) {

  }

  ngOnInit(){
    this.registrationForm = new FormGroup({
      'name': new FormGroup({
        'firstName': new FormControl(null,[Validators.required,Validators.minLength(1),Validators.maxLength(50)]),
        'lastName': new FormControl(null,[Validators.required,Validators.minLength(1),Validators.maxLength(50)]),
      },),
      'passwords': new FormGroup({
        'password': new FormControl(null,[Validators.required,Validators.minLength(5),Validators.maxLength(15)]),
        'confirmPassword': new FormControl(null,[Validators.required,Validators.minLength(5),Validators.maxLength(15)]),
      }, this.checkPasswordsMatch.bind(this)),
      'birthdate':new FormControl(null,[Validators.required]),
      'username': new FormControl(null,[Validators.required,Validators.minLength(2),Validators.maxLength(15)], this.forbiddenUsernames.bind(this)),
      'email': new FormControl(null,[Validators.required,Validators.email]),
      'checkbox': new FormControl(null,[Validators.required]),
      'gender':new FormControl(null,[Validators.required]),
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

  onSubmit()  {
    if(this.registrationForm.valid && !(sessionStorage.getItem('username'))){

        let data = {email:this.registrationForm.get('email').value,
        username:this.registrationForm.get('username').value,
        password:this.registrationForm.get('passwords.password').value}
        console.log(data)
        this.SocketService.emit('createUser',data, (res) => {
            if (res.err) {
                console.log(res.err)
            }
            else if (res.user) {
                sessionStorage.setItem('username', res.user.username)
                localStorage.setItem('username', res.user.username)
                this.sessionService.session()
                this.modalService.dismissAll()
                console.log(`user created: ${sessionStorage.getItem('username')}`)
            } else {
                console.log("an error occured")
            }
        })
      } else {
          console.log('nothing')
      }
  }

  forbiddenUsernames(control: FormControl): Promise<any> {
    console.log(this.registrationForm)
    const promise = new Promise<any>((resolve, reject) => {
      this.SocketService.emit('searchUser', [control.value], (res) => {

          if (res.res) {
            resolve({'forbiddenUsername': true});
          } else {
            resolve(null)
          }

        }
      )});
      return promise;
  }

  ngOnDestroy(){
    this.router.navigate(['/'])
  }

}

