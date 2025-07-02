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
import { BalanceService } from 'src/app/servicios/balance.service';
import { DeleteCuotasComponent } from '../dialogs/delete-cuotas/delete-cuotas.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolesService } from 'src/app/servicios/roles.service';
import { FinesService } from 'src/app/servicios/fines.service';
import { NotificationsService } from 'src/app/servicios/notifications.service';

registerLocaleData(localeEs, 'es');

@Component({
  selector: 'cuotas',
  templateUrl: './cuotas.component.html',
  styleUrls: ['./cuotas.component.css']
})
export class CuotasComponent implements OnInit {

  cuotasForm!: FormGroup;
  message: string = '';
  cookieUser: string = '';
  tokenDecoded: any;
  coutas: any;
  users: any;
  filtroDeudor: string = '';
  cuotasOriginales: any[] = [];

  rol = '';
  claimNames: string[] = [];
  multas:any;

  constructor(
    private fb: FormBuilder,
    private billsService: BillsService,
    private balanceService: BalanceService,
    private cookieService: CookieService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private rolesService: RolesService,
    private finesService: FinesService,
    private notificationsService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;
    console.log("tokenDecoded", this.tokenDecoded)

    this.cuotasForm = this.fb.group({
      description: ['', [Validators.required]],
      userId: ['', Validators.required],
      concept: ['', Validators.required]
    });

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de cuotas:', this.claimNames);
    });


    this.getUsers();
    this.getCuotas();
    this.getMultas();
  }

  onSubmit(): void {
    if (this.cuotasForm.valid) {
      console.log("CUOTAS FORM", this.cuotasForm.value)
      const payload = {
        Description: this.cuotasForm.value.description,
        Amount: this.cuotasForm.value.concept.Amount,
        UserId: this.cuotasForm.value.userId,
        Status: 'Pendiente',
        Concept: this.cuotasForm.value.concept.Name
      };
      console.log("PAYLOAD", payload)

      console.log(this.cuotasForm.value.userId);

      this.balanceService.registerBalanceForOne(this.cuotasForm.value.userId, payload).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.message = 'Registro exitoso';

          this.snackBar.open('Cuota registrada correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });
          this.sendNotification('Se ha registrado una cuota nueva', this.cuotasForm.value.userId);
          // Reset sin errores visuales
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

  updateStatus(cuota: any, newStatus: string) {
    console.log("CUOTA", cuota)
    this.balanceService.updateBalanceStatus(cuota.RecordId, newStatus).subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response);
        this.sendNotification('Se actualizó el estado de tu cuota "'+cuota.Concept+'", '+cuota.Description, cuota.UserId);

        this.getCuotas(); // Recarga la lista
      },
      error: (error) => {
        console.error('Error al actualizar el estado:', error);
        this.message = 'Error al actualizar el estado';
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

  getCuotas() {
    this.balanceService.getBalance()
      .subscribe(
        (success) => {
          this.coutas = success.data;
          this.cuotasOriginales = success.data;
          console.log(this.coutas);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getMultas() {
    this.finesService.getFines()
      .subscribe(
        (success) => {
          this.multas = success.fines;
          console.log("Multas",this.multas);
        },
        (error) => {
          console.log(error);
        }
      );
  }

  deleteCuota(cuota: any) {
    const dialogRef = this.dialog.open(DeleteCuotasComponent, {
      width: '500px',
      data: { cuota }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteCuota(cuota.RecordId, cuota);
      }
    });
  }

  confirmDeleteCuota(RecordId: number, cuota: any) {
    var CreatedBy = '';

    this.userService.getFullUser(cuota.UserId).subscribe({
      next: (response) => {
        CreatedBy = response.success.FirstName + ' ' + response.success.Email;

        const payload = {
          Description: ' Descripción:' + cuota.description + ', Monto:' + cuota.Amount,
          Module: 'Cuotas',
          DeletedBy: 'Borrado por casa: ' + this.tokenDecoded.casa + ', ' + this.tokenDecoded.nombre,
          CreatedBy: 'Cuota para: ' + CreatedBy,
          CreatedOn: cuota.CreatedOn,
          Notes: '',
        };

        this.billsService.deleteHistory(payload).subscribe({
          next: (response) => {
            console.log('Historial eliminado:', response);
          },
          error: (error) => {
            console.error('Error al eliminar el historial:', error);
          }
        });

      },
      error: (error) => {
        console.error('Error al obtener el usuario:', error);
      }
    });

    this.balanceService.deleteBalance(RecordId).subscribe({
      next: (response) => {
        console.log('Cuota eliminado:', response);
        this.message = 'Cuota eliminado exitosamente';
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al eliminar la cuota:', error);
        this.message = 'Error al eliminar la cuota';
      }
    });
  }


  filtrarPorDeudor(): void {
    const filtro = this.filtroDeudor.trim().toLowerCase();

    if (!filtro) {
      this.coutas = [...this.cuotasOriginales];
      return;
    }

    this.coutas = this.cuotasOriginales.filter(cuota =>
      cuota.UserFullName?.toLowerCase().includes(filtro) ||
      cuota.HouseNumber?.toString().includes(filtro)
    );
  }

  onTabChange(event: any): void {
    // Verifica si se seleccionó el tab de "Listado"
    if (event.index === 1) {
      this.getCuotas();
    }
  }


  hasClaim(name: string): boolean {
    return this.claimNames.includes(name);
  }

  sendNotification(description: any, userId: any){
    const payload = {
      Description: description,
      UserId: userId
    }

    this.notificationsService.registerNotification(payload)
    .subscribe(
        (success) => {
          console.log("Notificacion enviada correctamente");
        },
        (error) => {
          console.log(error);
        }
      );
  }

}
