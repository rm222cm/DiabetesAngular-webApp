import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  login(info) {
    return this.http.post('api/login', info);
  }
  twitterLogin() {
    return this.http.get('api/twitter-login');
  }
  logOut() {
    return this.http.get('api/logout');
  }
}
