import { venueModel } from 'src/app/models/venue.model';
import * as moment from 'moment'
import { FormBuilder } from '@angular/forms'

export class tripModel {
    name: String
    dateRange: {
        [key: string]: any
        start: Date
        end: Date
        length: Number
    }
    schedule?: Array<{
        day?: Date,
        venues: Array<{
            hour?: any
            venueName: String
            venueCity?: String
            venueAddress?: String
            price?: Number
        } | venueModel>
    }>
    isPrivate: boolean

    constructor(start: Date, end: Date, name: string, isPrivate?: boolean) {
        let final = moment(end)
       
        this.name = name
        this.dateRange = {
            start: start,
            end: end,
            length: final.diff(start, 'days') + 1
        }
        this.schedule = []
        for (let x = 0; x < this.dateRange.length; x++) {
            this.schedule.push({
                day: moment(start).add(x, 'days').toDate(),
                venues: []
            })
        }
        this.isPrivate = isPrivate? isPrivate : false
    }
}