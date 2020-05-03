import { SocketService } from '../../services/socket.service';
import { Component, OnDestroy, OnInit} from '@angular/core';
import { SessionService } from '../../services/session.service'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms'
import { ConstantPool } from '@angular/compiler';
import { resolve } from 'dns';


@Component({
    selector: 'app-registration',
    templateUrl:'./registration.component.html',
    styleUrls: ['./registrationpage.component.scss'],
})

export class registrationComponent {
    modal = null
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
  constructor(
    private SocketService: SocketService,
    private sessionService:SessionService,
    private modalService:NgbModal,
    private router:Router

    )
    {}
  registrationForm:FormGroup;


  ngOnInit(){
    this.registrationForm = new FormGroup({
      'username': new FormControl(null,[Validators.required],this.forbiddenUsernames),
      'password': new FormControl(null,[Validators.required]),
      'email': new FormControl(null,[Validators.required]),
      'checkbox': new FormControl(null,[Validators.required]),
    })
  }

  onSubmit()  {
    {
      if(!(sessionStorage.getItem('username'))){
          console.log('register sent')

          let data = {email:this.registrationForm.get('email').value,
          username:this.registrationForm.get('username').value,
          password:this.registrationForm.get('password').value}

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
  }
  forbiddenUsernames(control: FormControl): Promise<any> {
    const promise = new Promise<any>((resolve, reject) => {
      this.SocketService.emit('searchUser', control.value, (res) => {
          if (res.err) {
            resolve({'username is taken': true});
          }

        }
      )});
      return promise;

  }



  ngOnDestroy(){
    this.router.navigate(['/'])
  }
}

