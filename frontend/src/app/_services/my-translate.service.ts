import { Injectable } from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
//import { DateAdapter } from '@angular/material/core';
@Injectable({
  providedIn: 'root'
})
export class MyTranslateService {

  mobiletitle: string;

  mytranslateService: TranslateService;
  //adapter: DateAdapter<any>;
  adapterlang: any = {
    'th': 'th-TH',
    'en': 'en-US'
  };

  constructor( translateService: TranslateService) {
    this.mytranslateService = translateService;
    this.mobiletitle = '';
  }

  setAdpaterLocal(lang: string) {
    //this.adapter.setLocale(this.adapterlang[lang]);
  }

  setMobileTitle(title: string){
    this.mobiletitle = title;
  }
}
