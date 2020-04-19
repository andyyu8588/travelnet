import { SocketService } from '../../services/socket.service';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import{SessionService} from '../../services/session.service'
@Component({
    selector: 'app-loginpage',
    templateUrl:'./loginpage.component.html'
})

export class LoginComponent{
session:boolean = this.sessionService.session()



    constructor(private SocketService: SocketService, private sessionService:SessionService){
    }

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