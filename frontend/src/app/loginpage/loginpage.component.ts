//import { SocketService } from './../services/socket.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-loginpage',
    templateUrl:'./loginpage.component.html'
})
export class LoginComponent{
    hideContent = true;
    
    buttonClicked() {
        if (this.hideContent == true){
            this.hideContent = false;
        }
        else{
            this.hideContent = true;
        }
    }


   /* constructor(private SocketService: SocketService) {
        this.SocketService.listen('test').subscribe((data) => {
            console.log(`ok socket ${data}`)
        })
    }
    */
}