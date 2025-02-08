import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterPath } from '../../_models';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {
  routepath: any;

  constructor(private router: Router) {
    this.routepath = RouterPath;
  }

  ngOnInit() {
  }

}
