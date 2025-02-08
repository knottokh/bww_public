import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpRequest,
  HttpEventType,
  HttpResponse
} from "@angular/common/http";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { environment } from '../../environments/environment';
import { Promise } from 'q';
import { UploadImage } from '../_models';

const url = `${environment.apiUrl}/files/`;
const urlupload = `${environment.apiUrl}/`;

@Injectable({
  providedIn: 'root'
})
//Reading Excel File without Save To Local
export class UploadService {

  constructor(private http: HttpClient) {}

  public uploaddb(
    files: Set<UploadImage>,
    excelkeys: any,
    lasturl: string
  ): { [key: string]: { progress: Observable<number> , resresult: Observable<string> } } {
    // this will be the our resulting map
    const status: { [key: string]: { progress: Observable<number>, resresult: Observable<string> } } = {};

    files.forEach(ufile => {
      const file = ufile.file;
      // create a new multipart-form for every file
      const formData: FormData = new FormData();
      formData.append("file", file, file.name);

      if(excelkeys){
        formData.append("excelkeys", excelkeys);
      }
      //console.log(excelkeys);
      //console.log(formData);
      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest("POST", url + lasturl, formData, {
        reportProgress: true
      });

      // create a new progress-subject for every file
      const progress = new Subject<number>();
      const resresult = new Subject<string>();

      // send the http-request and subscribe for progress-updates

      let startTime = new Date().getTime();
      this.http.request(req).subscribe(event => {
        //console.log(event);
        if (event.type === HttpEventType.UploadProgress) {
          // calculate the progress percentage

          const percentDone = Math.round((100 * event.loaded) / event.total);
          // pass the percentage into the progress-stream
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {
          // Close the progress-stream if we get an answer form the API
          // The upload is complete
          //console.log(event.body['message']);
          //console.log(event);
          resresult.next(event.body['file_id']);
          resresult.complete();
          progress.complete();
          //console.log(status);
        }
      });

      // Save every progress-observable in a map of all observables
      status[file.name] = {
        progress: progress.asObservable(),
        resresult: resresult.asObservable()
      };
    });

    // return the map of progress.observables
    return status;
  }

  public uploaddbFile(
    files: Set<File>,
    excelkeys: any,
    lasturl: string
  ): { [key: string]: { progress: Observable<number> , resresult: Observable<string> } } {
    const status: { [key: string]: { progress: Observable<number>, resresult: Observable<string> } } = {};

    files.forEach(file => {
      // create a new multipart-form for every file
      const formData: FormData = new FormData();
      formData.append("file", file, file.name);

      if(excelkeys){
        formData.append("excelkeys", excelkeys);
      }
      //console.log(excelkeys);
      //console.log(formData);
      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest("POST", url + lasturl, formData, {
        reportProgress: true
      });

      // create a new progress-subject for every file
      const progress = new Subject<number>();
      const resresult = new Subject<string>();

      // send the http-request and subscribe for progress-updates

      let startTime = new Date().getTime();
      this.http.request(req).subscribe(event => {
        //console.log(event);
        if (event.type === HttpEventType.UploadProgress) {
          // calculate the progress percentage

          const percentDone = Math.round((100 * event.loaded) / event.total);
          // pass the percentage into the progress-stream
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {
          // Close the progress-stream if we get an answer form the API
          // The upload is complete
          //console.log(event.body['message']);
          //resresult.next(event.body['message']);
          console.log('file_id:',event.body['file_id']);
          resresult.next(event.body['file_id']);
          resresult.complete();
          progress.complete();
          //console.log(status);
        }
      });

      // Save every progress-observable in a map of all observables
      status[file.name] = {
        progress: progress.asObservable(),
        resresult: resresult.asObservable()
      };
    });

    // return the map of progress.observables
    return status;
  }

  public uploaddbFileWithGroupType(
    files: Set<File>,
    group:string,
    course_type: string,
    //excelkeys: any,
    lasturl: string
  ): { [key: string]: { progress: Observable<number> , resresult: Observable<string> } } {
    const status: { [key: string]: { progress: Observable<number>, resresult: Observable<string> } } = {};

    files.forEach(file => {
      // create a new multipart-form for every file
      const formData: FormData = new FormData();
      formData.append("file", file, file.name);

      if(group){
        formData.append("group", group);
      }

      if(course_type){
        formData.append("course_type", course_type);
      }

      // if(excelkeys){
      //   formData.append("excelkeys", excelkeys);
      // }
      //console.log(excelkeys);
      //console.log(formData);
      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest("POST", urlupload + lasturl, formData, {
        reportProgress: true
      });

      // create a new progress-subject for every file
      const progress = new Subject<number>();
      const resresult = new Subject<string>();

      // send the http-request and subscribe for progress-updates

      let startTime = new Date().getTime();
      this.http.request(req).subscribe(event => {
        //console.log(event);
        if (event.type === HttpEventType.UploadProgress) {
          // calculate the progress percentage

          const percentDone = Math.round((100 * event.loaded) / event.total);
          // pass the percentage into the progress-stream
          progress.next(percentDone);
        } else if (event instanceof HttpResponse) {
          // Close the progress-stream if we get an answer form the API
          // The upload is complete
          //console.log(event.body['message']);
          //resresult.next(event.body['message']);
          console.log(event.body);
          console.log('file_id:',event.body['file_id']);
          resresult.next(event.body['file_id']);
          resresult.complete();
          progress.complete();
          //console.log(status);
        }
      });

      // Save every progress-observable in a map of all observables
      status[file.name] = {
        progress: progress.asObservable(),
        resresult: resresult.asObservable()
      };
    });

    // return the map of progress.observables
    return status;
  }

  public uploadFileWithKey(
    file: File,
    keyupload: string,
    userid: string,
    lasturl: string
  ){
    return Promise((resolve, reject) => {
      const formData: FormData = new FormData();
      formData.append(keyupload, file, userid);
      //formData.append('userId', userid);
      //console.log(formData);
      // create a http-post request and pass the form
      // tell it to report the upload progress
      const req = new HttpRequest("POST", url + lasturl, formData, {
        reportProgress: true
      });
      this.http.request(req).subscribe(event => {
        if (event instanceof HttpResponse) {
            resolve(event.body);
        }
      }, error =>{
          reject(error);
      });
    });
  }

  public deletemany(delids: any) {
    return this.http.post(`${url}remove/multi`, {
      ids: delids
    });
  }
}
