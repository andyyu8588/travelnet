import { FormGroup, FormControl, Validators } from '@angular/forms'
import { SocketService } from 'src/app/services/chatsystem/socket.service'
import { Component, OnDestroy, OnInit } from '@angular/core'
import { SessionService } from 'src/app/services/session.service'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { Router } from '@angular/router'

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./loginpage.component.scss'],
})

export class loginComponent {
    modal = null
    constructor(private modalService: NgbModal ) {
      this.openModal()
    }

    openModal() {
        this.modal = this.modalService.open(LoginComponent, {})
    }
}


@Component({
    selector: 'app-loginpage',
    templateUrl: './loginpage.component.html',
    styleUrls: ['./loginpage.component.scss'],
    providers: [NgbModalConfig, NgbModal]
})

export class LoginComponent implements OnInit, OnDestroy{
    loginForm: FormGroup
    login_err = false
    hide = true

    constructor(private SocketService: SocketService,
                private sessionService: SessionService,
                private modalService: NgbModal,
                private router: Router) { }

    ngOnInit() {
        this.loginForm = new FormGroup({
            username: new FormControl(null, Validators.required),
            password: new FormControl(null, Validators.required)
        })
    }

    // handle user login with socket
    loginClicked() {
        if (!(sessionStorage.getItem('username'))) {
            const credentials = {
                email: this.loginForm.get('username').value,
                password: this.loginForm.get('password').value
            }
            this.login_err = false
            this.SocketService.emit('login', credentials, (data: any) => {
                if (data.err || data === '') {
                    console.log(data.err)
                    this.login_err = true
                    this.loginForm.get('password').reset()
                }
                else if (data.res) {
                    sessionStorage.setItem('username', data.res)
                    localStorage.setItem('token', data.token)
                    localStorage.setItem('username', data.res)
                    this.modalService.dismissAll()
                    this.sessionService.session()
                    this.router.navigate(['/home'])
                } else {
                    console.log('login fini')
                }
            })
        } else {
            sessionStorage.removeItem('username')
            this.loginClicked()
        }
    }

    ngOnDestroy(){
        // this.router.navigate(['/'])
    }
}
