import { SocketService } from './../../services/socket.service';
import { Component } from '@angular/core';

@Component({
    selector: 'app-registrationpage',
    templateUrl:'./registrationpage.component.html'
})
export class RegistrationComponent{
    hideContent = true;
    
    constructor(private SocketService: SocketService) {

    }

    buttonClicked() {
        console.log('bhay cooki: ' + localStorage.getItem('username'))
        if (this.hideContent == true){
            this.hideContent = false;
        }
        else{
            this.hideContent = true;
        }
    }

    registerClicked(password, username, email, event: Event){
        event.preventDefault()
        if(!(sessionStorage.getItem('username'))){
            this.SocketService.once('createUser_res').subscribe((data: any) => {
                if (data.err) {
                    console.log(data.err)
                } 
                else if (data.res) {
                    sessionStorage.setItem('username', data.res)
                    console.log(`user created: ${sessionStorage.getItem('username')}`)
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