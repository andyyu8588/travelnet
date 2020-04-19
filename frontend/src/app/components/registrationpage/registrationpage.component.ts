import { SocketService } from '../../services/socket.service';
import { Component, Input } from '@angular/core';
import{SessionService} from '../../services/session.service'

@Component({
    selector: 'app-registrationpage',
    templateUrl:'./registrationpage.component.html'
})

export class RegistrationComponent{
session:boolean = this.sessionService.session()

    constructor(private SocketService: SocketService, private sessionService:SessionService) {
    }

  

    registerClicked(password, username, email, event: Event){
        // event.preventDefault()
        if(!(sessionStorage.getItem('username'))){
            this.SocketService.once('createUser_res').subscribe((data: any) => {
                if (data.err) {
                    console.log(data.err)
                } 
                else if (data.res) {
                    sessionStorage.setItem('username', data.res)
                    console.log(`user created: ${sessionStorage.getItem('username')}`)
                    location.reload();
                } else {
                    console.log("c fini")
                    console.log(data)
                }
            })
            this.SocketService.emit('createUser', {email:email, username:username, password:password})
        } else {
            console.log('nothing')
        }   
    }
}