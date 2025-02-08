import { Injectable } from '@angular/core';
import * as _moment from 'moment-timezone';
const moment = _moment;

@Injectable({
  providedIn: 'root'
})
export class ShareService {
  tz = 'Asia/Bangkok';
  format = 'M/D/YYYY HH:mm:ss';
  //format = 'YYYY-MM-DD HH:mm:ss';
  dateformat = 'M/D/YYYY';
  timeformat = 'HH:mm:ss';
  viewdateformat = 'DD/MM/YYYY';
  moment = moment;
  imageTimeStamp: any;
  translateage = {
    new: "-",
    years: "years",
    months: "months",
    weeks: "weeks",
    days: "days"
  };

  constructor() { }

  public setImageTime(): void{
    this.imageTimeStamp = (new Date()).getTime();
  }
  get imagetime(){
    return this.imageTimeStamp;
  }
  get timestamp() {
    return moment().tz(this.tz).format(this.format);
  }

  public getToDBDate(date: any) {
    try {
      if (typeof date === "string") {
        return moment(date).tz(this.tz).format('M/D/YYYY 07:00');
      }
      else {
        if (date instanceof Date) {
          let day: string = date.getDate().toString();
          //day = +day < 10 ? '0' + day : day;
          let month: string = (date.getMonth() + 1).toString();
          //month = +month < 10 ? '0' + month : month;
          let year = date.getFullYear();
          return `${month}/${day}/${year} 07:00`;
        } else {
          return date.format('M/D/YYYY 07:00');
        }
      }
    }
    catch { }
    return '';
  }

  public getFormattedDateDiff (date1, date2, intervals?) {
    var b = moment(date1),
        a = moment(date2),
        intervals = intervals || ['years','months','weeks','days'],
        sum = 0,
        out = [];

    intervals.forEach((interval) => {
        var diff = a.diff(b, interval);
        sum += diff;
        b.add(diff, interval);
        if(diff > 0){
          out.push(diff + ' ' + this.translateage[interval]);
        }
    });
    if(sum > 0){
    return out.join(' ');
    }
    else{
      return this.translateage.new;
    }
  }
  public getDateDiff (date1, date2, interval) {
    var b = moment(date1),
        a = moment(date2),
        interval = interval || 'days';

    return a.diff(b, interval);
  }
}
