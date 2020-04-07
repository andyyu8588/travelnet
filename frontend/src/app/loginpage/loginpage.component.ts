import { SocketService } from './../services/socket.service';
import { Component } from '@angular/core';

@Component({
    selector: 'app-loginpage',
    templateUrl:'./loginpage.component.html'
})
export class LoginComponent{

    constructor(private SocketService: SocketService) {
        this.SocketService.listen('test').subscribe((data) => {
            console.log(`ok socket ${data}`)
        })
    }

}