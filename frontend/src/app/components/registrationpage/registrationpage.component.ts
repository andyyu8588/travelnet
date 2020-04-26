import { SocketService } from '../../services/socket.service';
import { Component} from '@angular/core';
import{SessionService} from '../../services/session.service'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
    selector: 'app-registration',
    templateUrl:'./registration.component.html',
    styleUrls: ['./registrationpage.component.scss'],
})
export class registrationComponent{
    modal = null
    constructor(private modalService:NgbModal, private SessionService:SessionService) {

    this.openModal()

    this.modal.result.then(()=> {

        this.SessionService.changeFeature()
        }, ()=>{

        this.SessionService.changeFeature()
        //gets triggers when modal is dismissed.
       });
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

export class RegistrationComponent{

    constructor(private SocketService: SocketService, private sessionService:SessionService, private modalService:NgbModal) {
    }
    // send register request with socket
    registerClicked(password: string, username: string, email: string){
        // event.preventDefault()
        if(!(sessionStorage.getItem('username'))){            
            console.log('register sent')
            this.SocketService.emit('createUser', {email:email, username:username, password:password}, (res) => {
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
                    console.log("c fini")
                }
            })
        } else {
            console.log('nothing')
        }
    }
}
