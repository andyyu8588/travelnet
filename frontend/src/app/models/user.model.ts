import { tripModel } from './trip.model';
export class userModel {
    email: String
    username: String
    password: String
    firstname: String
    lastname: String
    birthdate: Date
    gender: String
    profilepicture: String
    friends: Array<string>
    friendsAdded: Array<string>
    friendsReceived: Array<string>
    rooms:  Array<any>
    socketIds: Array<any>
    isActive:  Boolean
    log: {
        in: Array<any>,
        out: Array<any>
    }
    trips: Array<tripModel>
    history: Array<tripModel>
    wishlist: Array<any>
}
