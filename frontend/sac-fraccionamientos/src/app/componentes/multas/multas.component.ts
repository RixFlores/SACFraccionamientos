import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { BillsService } from 'src/app/servicios/bills.service';
import { jwtDecode } from 'jwt-decode';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { DeleteBillsComponent } from '../dialogs/delete-bills/delete-bills.component';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/servicios/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolesService } from 'src/app/servicios/roles.service';
import { FinesService } from 'src/app/servicios/fines.service';
import { DeleteFineComponent } from '../dialogs/delete-fine/delete-fine.component';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'multas',
  templateUrl: './multas.component.html',
  styleUrls: ['./multas.component.css']
})
export class MultasComponent implements OnInit {
  finesForm!: FormGroup;
  message: string = '';
  cookieUser: string = '';
  tokenDecoded: any;
  fines: any;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  rol = '';
  claimNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private finesService: FinesService,
    private cookieService: CookieService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private rolesService: RolesService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;

    this.finesForm = this.fb.group({
      name: ['', [Validators.required]],
      amount: ['', Validators.required]
    });

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de servicio:', this.claimNames);
    });

    this.getFines();
  }

  onSubmit(): void {
    if (this.finesForm.valid) {
      const payload = {
        Name: this.finesForm.value.name,
        Amount: this.finesForm.value.amount
      };

      this.finesService.registerFine(payload).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.message = 'Registro exitoso';

          // Mostrar snackbar
          this.snackBar.open('Gasto registrado correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          this.ngOnInit();
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          this.message = 'Error en el registro';
          const errorMsg = error.error?.msg || 'Error desconocido en el registro';

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


  getDecodedAccessToken(accessToken: string): any {
    try {
      return jwtDecode(accessToken);
    } catch (Error) {
      var invalid = "Invalid user";
    }
  }

  getFines() {
    this.finesService.getFines()
      .subscribe(
        (success) => {
          this.fines = success.fines
          console.log("Multas",this.fines)
        },
        (error) => {
          console.log(error);
        }
      );
  }

  deleteFine(fine: any) {
    const dialogRef = this.dialog.open(DeleteFineComponent, {
      width: '500px',
      data: { fine }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteFine(fine.FineId);
      }
    });
  }

  confirmDeleteFine(fineId: number) {
    this.finesService.deleteFine(fineId).subscribe({
      next: (response) => {
        this.message = 'Multa eliminada exitosamente';
        this.snackBar.open('Multa Eliminada correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al eliminar la multa:', error);
        this.message = 'Error al eliminar la multa';
      }
    });
  }


  onTabChange(event: any): void {
    // Verifica si se seleccionó el tab de "Listado"
    if (event.index === 1) {
      this.getFines();
    }
  }
  
  hasClaim(name: string): boolean {
    return this.claimNames.includes(name);
  }
}
