import { Component } from '@angular/core';
import { MyTranslateService } from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'BWW';
  constructor(private translateService: MyTranslateService) {
    let defaultlang = 'th';
    // this language will be used as a fallback when a translation isn't found in the current language
    translateService.mytranslateService.setDefaultLang(defaultlang);

     // the lang to use, if the lang isn't available, it will use the current loader to get them
    translateService.mytranslateService.use(defaultlang);
    translateService.setAdpaterLocal(defaultlang);
  }
}
