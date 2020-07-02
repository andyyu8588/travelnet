export class tripModel {
    date: any
    name: String
    venues?: Array<{
        time?: Date,
        name: String,
        price?: Number
    }>
}