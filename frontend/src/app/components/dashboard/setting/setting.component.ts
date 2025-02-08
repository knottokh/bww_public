import { Component, OnInit } from '@angular/core';
import { RouterPath } from 'src/app/_models';

@Component({
  selector: 'app-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {
  routepath: any;
  rootsetting: string = '';
  constructor() {
    this.routepath = RouterPath;
    this.rootsetting = `/${this.routepath.setting}`;
  }

  ngOnInit(): void {
  }

}
