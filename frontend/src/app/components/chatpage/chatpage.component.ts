import { SocketService } from './../../services/socket.service';
import { Component } from '@angular/core';

@Component({
    selector: 'app-chatpage',
    templateUrl:'./chatpage.component.html'
})
export class ChatpageComponent{
    constructor(){
        sessionStorage.clear()
        localStorage.clear()
    }
}