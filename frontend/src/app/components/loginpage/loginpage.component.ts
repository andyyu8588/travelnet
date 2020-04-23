import { SocketService } from '../../services/socket.service';
import { Component} from '@angular/core';
import{SessionService} from '../../services/session.service'
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
    selector: 'app-login',
    templateUrl:'./login.component.html',
    styleUrls: ['./loginpage.component.scss'],
})

export class loginComponent{
    modal = null
    constructor(private modalService:NgbModal, private SessionService:SessionService) {

    this.openModal()

    this.modal.result.then(()=>{
        
        this.SessionService.changeFeature()
       }, ()=>{
        
        this.SessionService.changeFeature()
        //gets triggers when modal is dismissed.
       });
    }
    openModal(){
        this.modal = this.modalService.open(LoginComponent,{})
        }
    }
    








@Component({
    selector: 'app-loginpage',
    templateUrl:'./loginpage.component.html',
    styleUrls: ['./loginpage.component.scss'],
    providers:[NgbModalConfig,NgbModal]
})

export class LoginComponent{

    constructor(private SocketService: SocketService, private sessionService:SessionService){

    }

    //handle user login with socket
    loginClicked(password, username, event: Event){
        if(!(sessionStorage.getItem('username'))){
            this.SocketService.once('UserIn_res').subscribe((data: any) => {
                if (data.err) {
                    console.log(data.err)
                } 
                else if (data.res) {
                    sessionStorage.setItem('username', data.res)
                    console.log(sessionStorage.getItem('username'))
                    location.reload();
                }
            })
            this.SocketService.emit('UserIn', {email:username , password:password})
        } else {
            console.log('nothing')
        }
    }
}