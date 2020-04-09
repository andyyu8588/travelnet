import { SocketService } from './../../services/socket.service';
import { Component } from '@angular/core';

@Component({
    selector: 'app-registrationpage',
    templateUrl:'./registrationpage.component.html'
})
export class RegistrationComponent{
    hideContent = true;
    
    constructor(private SocketService: SocketService) {
        this.SocketService.listen('createUser_res').subscribe((data: any) => {
            if (data === 'error') {
                console.log(data.exp)
            } 
            else if (data === 'ok') {
                console.log("User created")
            } else {
                console.log("c fini")
                console.log(data)
            }
        })
    }

    buttonClicked() {
        if (this.hideContent == true){
            this.hideContent = false;
        }
        else{
            this.hideContent = true;
        }
    }

    registerClicked(password, username, email, event: Event){
        event.preventDefault()
        this.SocketService.emit('createUser', {email:email, username:username, password:password})
        
    }
}