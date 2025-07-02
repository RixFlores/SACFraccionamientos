import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { VisitsService } from 'src/app/servicios/visits.service';
import { UserService } from 'src/app/servicios/user.service';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { DeleteVisitorsComponent } from '../dialogs/delete-visitors/delete-visitors.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolesService } from 'src/app/servicios/roles.service';

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
  rol = '';
  claimNames: string[] = [];

  constructor(
    private visitsService: VisitsService,
    private userService: UserService,
    private fb: FormBuilder,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private rolesService: RolesService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;

    this.registerForm = this.fb.group({
      Name: ['', Validators.required],
      UserId: [null, Validators.required],
      Status: ['Entra', Validators.required],
      Vehicle: ['', Validators.required],
      NumberOfVisitors: ['', Validators.required],
      RegisteredBy: [this.tokenDecoded.id, Validators.required],
    });

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de servicio:', this.claimNames);
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
        UserId: this.registerForm.value.UserId,
        Status: 'Entra',
        Vehicle: this.registerForm.value.Vehicle,
        NumberOfVisitors: this.registerForm.value.NumberOfVisitors,
        RegisteredBy: this.tokenDecoded.id,
      };

      this.visitsService.registerVisit(payload).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.message = 'Registro exitoso';

          this.snackBar.open('Visita registrada correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          this.registerForm.reset({
            Name: '',
            UserId: null,
            Status: 'Entra',
            Vehicle: '',
            NumberOfVisitors: 0,
            RegisteredBy: this.tokenDecoded.id
          });

          this.ngOnInit();
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          const errorMsg = error.error?.msg || 'Error desconocido en el registro';
          this.message = errorMsg;

          this.snackBar.open(`Error: ${errorMsg}`, 'Cerrar', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-error']
          });
        }
      });

    } else {
      console.log('Formulario inválido');
      this.message = 'Formulario inválido';

      this.snackBar.open('Por favor completa todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-warning']
      });
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

    updateStatus(visit: any, newStatus: string) {
      console.log("visita", visit)
    this.visitsService.updateVisitStatus(visit.VisitorId, newStatus).subscribe({
      next: (response) => {
        console.log('Visita actualizado:', response);
        this.ngOnInit(); // Recarga la lista
      },
      error: (error) => {
        console.error('Error al actualizar la visita:', error);
        this.message = 'Error al actualizar la visita';
      }
    });
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


  hasClaim(name: string): boolean {
    return this.claimNames.includes(name);
  }
}
