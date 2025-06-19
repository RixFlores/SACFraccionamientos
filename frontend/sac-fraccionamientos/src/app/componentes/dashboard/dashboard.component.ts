import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  isMenuOpen = false;
  vista = '';
  cookieUser: string = '';
  tokenDecoded: any;
  debtor= '';
  rol ='';

  constructor(
    private cookieService: CookieService,

  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;
    console.log("rol", this.rol);
    console.log("tokenDecoded", this.tokenDecoded)
    if(this.cookieUser === '') {
      window.location.href = '/login';
    }
  }

  getDecodedAccessToken(accessToken: string): any {
    try {
      return jwtDecode(accessToken);
    } catch (Error) {
      var invalid = "Invalid user";
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  cerrarSesion() {
    this.cookieService.delete('accessToken');
    window.location.reload();
  }

}
