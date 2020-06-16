import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';

import { SimpleModalComponent, ModalDialogService } from 'ngx-modal-dialog';

import { LoginInfo } from './login-info';
import { LoginService } from '../services/login.service';
import { routerNgProbeToken } from '@angular/router/src/router_module';

import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {
  loginInfo: LoginInfo = {
    email: '',
    pass: ''
  }

  errMsg: any = {
    class: 'hidden',
    msg: ''
  }
  constructor(private loginService: LoginService, private router: Router, private modalService: ModalDialogService, private viewRef: ViewContainerRef,private translate: TranslateService) { }
  
  ngOnInit() {
  }
  
  onChange() {
    this.errMsg = {
      class:'hidden',
      msg: ''
    }
  }

  twitterLogin() {
    this.loginService.twitterLogin()
    .subscribe((res: any) => {
      const url = res.authURL;
        if(res.authURL) {
          window.location.href = url;
          return;
        }
      })
  }

  onSubmit(info: LoginInfo): void {
    this.loginService.login(info)
      .subscribe((res: any) => {
        if(res.err) {
          this.errMsg.class = null;
          this.errMsg.msg = res.err;
          return;
        }
        this.modalService.openDialog(this.viewRef, {
          title: this.translate.instant('loginpop.title'),
          childComponent: SimpleModalComponent,
          data: {
            text: this.translate.instant('loginpop.success')
          },
          actionButtons: [
            { text: this.translate.instant('loginpop.continue'),
              onAction: () => {
              window.localStorage.setItem('sid', res.name)
              this.router.navigateByUrl(res.redirect);
              return true;
              }
            }
          ],
          });
        });
  }
}
