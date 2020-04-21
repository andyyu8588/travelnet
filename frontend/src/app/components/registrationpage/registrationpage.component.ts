import { SocketService } from '../../services/socket.service';
import { Component, Input } from '@angular/core';
import{SessionService} from '../../services/session.service'

@Component({
    selector: 'app-registrationpage',
    templateUrl:'./registrationpage.component.html',
    styleUrls: ['./registrationpage.component.scss']
})

export class RegistrationComponent{
    session: boolean = this.sessionService.session()

    constructor(private SocketService: SocketService, private sessionService:SessionService) {
        
    }

  
    //send register request with socket
    registerClicked(password: string, username: string, email: string){
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
            console.log('register sent')
            this.SocketService.emit('createUser', {email:email, username:username, password:password})
        } else {
            console.log('nothing')
        }   
    }
}