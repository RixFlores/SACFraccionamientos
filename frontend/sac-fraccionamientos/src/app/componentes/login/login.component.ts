import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, NgForm, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
/* 
import { SpinnerService } from 'src/app/services/spinner/spinner.service'; */
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/servicios/user.service';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {
  apiUrl = `${environment.api_host}/api/`;

  email = new UntypedFormControl('', [Validators.required, Validators.email]);
  credential: any = {
    email: '',
    password: ''
  }
  public token: string | undefined;

  @ViewChild('loginForm') loginForm?: NgForm;

  contra = new UntypedFormControl('', [Validators.required]);
  hide = true;
  public cookieUser: string = '';
  public userJson: any = '';
  public spinnerShow: boolean = false;
  public role: Array<any> = [];
  public loginError: string = '';

  constructor(
    private http: HttpClient,
    private snackbar: MatSnackBar,
    private router: Router,
    private cookieService: CookieService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    if (this.cookieUser) {
      this.userJson = this.getDecodedAccessToken(this.cookieUser);
      if (this.userJson["UserId"]) {
        this.router.navigate(['panel']);
      }
      this.role = this.userJson["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      console.log("role ", this.role)
    }
  }

  getDecodedAccessToken(accessToken: string): any {
    try {
      return jwtDecode(accessToken);
    } catch (Error) {
      this.userJson = "Invalid user";
    }
  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'Email requerido';
    }
    return this.email.hasError('email') ? 'Email no valido' : '';
  }

  login() {
    /* this.spinnerService.show(); */
    this.spinnerShow = true;
    if (this.loginForm?.form.valid) {
      this.userService.login(this.credential).subscribe({
        next: (response) => {
          console.log('Login exitoso:', response);
          this.cookieService.set('accessToken', response.accessToken);
          this.cookieService.set('refreshToken', response.refreshToken);
          //redirige 
          this.router.navigate(['panel']);
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          this.spinnerShow = false;
          if (error.status === 401) {
            this.loginError = 'Contraseña incorrecta';
          } else {
            this.loginError = 'Usuario o contraseña incorrectos';
          }
        }
      });
    }
  }
}
