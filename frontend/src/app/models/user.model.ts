import { tripModel } from './trip.model';
export class userModel {
    email: String
    username: String
    password: String
    birthdate: Date
    gender: String
    profilepicture: String
    followers: Array<string>
    following: Array<string>
    friendsReceived: Array<string>
    rooms:  Array<any>
    socketIds: Array<any>
    isActive:  Boolean
    log: {
        in: Array<any>,
        out: Array<any>
    }
    trips: Array<tripModel>
    history: Array<any>
    wishlist: Array<any>
}
