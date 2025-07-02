import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { NotificationsService } from 'src/app/servicios/notifications.service';

@Component({
  selector: 'notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css']
})
export class NotificacionesComponent implements OnInit {
  cookieUser: string = '';
  tokenDecoded: any;
  rol = '';
  notifications: any;

  constructor(
    private cookieService: CookieService,
    private notificationsService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    console.log("TOKEN", this.tokenDecoded.id)
    this.rol = this.tokenDecoded.rol;

    this.notificationsService.getNotificationsByUserId(this.tokenDecoded.id)
      .subscribe(
        (success) => {
          this.notifications = success.data
          console.log(success)
        },
        (error) => {
          console.log(error);
        }
      );
  }

  updateStatus(notificationId: any, status: any) {
    const payload = {
      Status: status
    }

    this.notificationsService.updateNotification(notificationId, payload)
      .subscribe(
        (success) => {
          console.log(success)
          this.ngOnInit();
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getDecodedAccessToken(accessToken: string): any {
    try {
      return jwtDecode(accessToken);
    } catch (Error) {
      var invalid = "Invalid user";
    }
  }

}
