import { SocketService } from '../../services/socket/socket.service';
import {RegistrationComponent} from '../registrationpage/registrationpage.component';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';

@Component({
    selector: 'app-loginpage',
    templateUrl:'./loginpage.component.html'
})
export class LoginComponent{
    @Input('loginPage') visibility:boolean = true;
    
    

    constructor(private SocketService: SocketService){
    }

    buttonClicked() {
        if(RegistrationComponent)
       this.visibility = !this.visibility
    }
    

    loginClicked(password, username, event: Event){
        // event.preventDefault()
        if(!(sessionStorage.getItem('username'))){
            this.SocketService.once('UserIn_res').subscribe((data: any) => {
                if (data.err) {
                    console.log(data.err)
                } 
                else if (data.res) {
                    sessionStorage.setItem('username', data.res)
                    console.log(sessionStorage.getItem('username'))
                }
            })
            this.SocketService.emit('UserIn', {email:username , password:password})
        } else {
            console.log('nothing')
        }
    }
}