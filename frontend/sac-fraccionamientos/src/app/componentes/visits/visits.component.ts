import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitsService } from 'src/app/servicios/visits.service';
import { UserService } from 'src/app/servicios/user.service';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { DeleteVisitorsComponent } from '../dialogs/delete-visitors/delete-visitors.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'visits',
  templateUrl: './visits.component.html',
  styleUrls: ['./visits.component.css']
})
export class VisitsComponent implements OnInit {
  visitors: any;
  registerForm!: FormGroup;
  message: string = '';
  users: any;
  vehicles = ['Auto', 'Camioneta', 'Motocicleta', 'Bicicleta', 'Ninguno', 'Otro'];
  cookieUser: string = '';
  tokenDecoded: any;

  constructor(
    private visitsService: VisitsService,
    private userService: UserService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);

    this.registerForm = this.fb.group({
      Name: ['', Validators.required],
      UserId: [null, Validators.required],
      Status: ['Entra', Validators.required],
      Vehicle: ['', Validators.required],
      NumberOfVisitors: ['', Validators.required],
      RegisteredBy: [this.tokenDecoded.id, Validators.required],
    });

    this.visitsService.getVisits()
      .subscribe(
        (success) => {
          this.visitors = success.result
          console.log(success)
        },
        (error) => {
          console.log(error);
        }
      );

    this.getUsers();

  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const payload = {
        Name: this.registerForm.value.Name,
        UserId: this.registerForm.value.UserId, // o crea otro campo para esto
        Status: 'Entra',
        Vehicle: this.registerForm.value.Vehicle,
        NumberOfVisitors: this.registerForm.value.NumberOfVisitors,
        RegisteredBy: this.tokenDecoded.id,
      };

      this.visitsService.registerVisit(payload).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.message = 'Registro exitoso';
          this.registerForm.reset({
            Name: '',
            UserId: null,
            Status: 'Entra',
            Vehicle: '',
            NumberOfVisitors: 0,
            RegisteredBy: this.tokenDecoded.id
          });

        },
        error: (error) => {
          console.error('Error al registrar:', error);
          this.message = 'Error en el registro';
          if (error.error?.msg) {
            this.message = `Error: ${error.error.msg}`;
          } else {
            this.message = 'Error desconocido en el registro';
          }
        }
      });

    } else {
      console.log('Formulario inválido');
      this.message = 'Formulario inválido';
    }
  }

  getUsers() {
    this.userService.getUsers()
      .subscribe(
        (success) => {
          this.users = success.success
          console.log(this.users)
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

  deleteVisit(visit: any) {
    const dialogRef = this.dialog.open(DeleteVisitorsComponent, {
      width: '500px',
      data: { visit }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteVisitor(visit.VisitorId);
      }
    });
  }

  confirmDeleteVisitor(VisitorId: number) {
    console.log('Confirmar eliminación de la visita con ID:', VisitorId);
    this.visitsService.deleteVisits(VisitorId).subscribe({
      next: (response) => {
        console.log('Visita eliminada:', response);
        this.message = 'Visita eliminada exitosamente';
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al eliminar la visita:', error);
        this.message = 'Error al eliminar la visita';
      }
    });
  }

}
