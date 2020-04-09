import { SocketService } from './../../services/socket.service';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
    selector: 'app-loginpage',
    templateUrl:'./loginpage.component.html'
})
export class LoginComponent{
    hideContent = true;
    

    constructor(private SocketService: SocketService){
        this.SocketService.listen('UserIn_res').subscribe((data: any) => {
            if(data.ans === 'error'){
                console.log(data.exp)
            } 
            else if(data.ans === 'ok'){
                console.log(data.cookie)
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

    loginClicked(password, username, event: Event){
        event.preventDefault()
        this.SocketService.emit('UserIn', {email:username , password:password})
        
    }
}