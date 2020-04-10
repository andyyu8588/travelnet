import { SocketService } from './../../services/socket.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-loginpage',
    templateUrl:'./loginpage.component.html'
})
export class LoginComponent{
    hideContent = true;
    

    constructor(private SocketService: SocketService){
    }

    buttonClicked() {
        if (this.hideContent == true){
            this.hideContent = false;
        }
        else{
            this.hideContent = true;
        }
    }

    loginClicked(password, username, event: Event){
        event.preventDefault()
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
        
    }
}