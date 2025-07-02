import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { RolesService } from 'src/app/servicios/roles.service';
import { NotificationsService } from 'src/app/servicios/notifications.service';

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
  debtor = '';
  rol = '';
  roles: any;
  rolId: any;
  claims: any;
  claimNames: string[] = [];
  notifications: any;
  notificationsCounter = 0;
  constructor(
    private cookieService: CookieService,
    private rolesService: RolesService,
    private notificationService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de servicio:', this.claimNames);
    });

    this.notificationService.getNotificationsByUserId(this.tokenDecoded.id)
      .subscribe(
        (success) => {
          this.notifications = success.data
          this.notificationsCounter = this.notifications.filter((n: any) => n.Status === 'N').length;
        },
        (error) => {
          console.log(error);
        }
      );

    if (this.cookieUser === '') {
      window.location.href = '/login';
    }
  }

  hasClaim(name: string): boolean {
    return this.claimNames.includes(name);
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
    window.location.href = '/login';
  }

}
