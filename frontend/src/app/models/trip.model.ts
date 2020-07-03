export class tripModel {
    name: String
    dateRange: {
        [key: string]: any
        start: Date
        end: Date
    }
    schedule?: Array<{
        time?: Date,
        venues: Array<{
            hour?: any
            venueName: String
            price?: Number
        }>
    }>
}