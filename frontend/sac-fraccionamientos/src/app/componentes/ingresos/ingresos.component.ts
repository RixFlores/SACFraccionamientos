import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { IncomesService } from 'src/app/servicios/incomes.service';
import { jwtDecode } from 'jwt-decode';
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';
import { UserService } from 'src/app/servicios/user.service';
import { DeleteIncomesComponent } from '../dialogs/delete-incomes/delete-incomes.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolesService } from 'src/app/servicios/roles.service';
import { BalanceService } from 'src/app/servicios/balance.service';
import { NotificationsService } from 'src/app/servicios/notifications.service';
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'ingresos',
  templateUrl: './ingresos.component.html',
  styleUrls: ['./ingresos.component.css']
})
export class IngresosComponent implements OnInit {
  incomesForm!: FormGroup;
  message: string = '';
  cookieUser: string = '';
  tokenDecoded: any;
  incomes: any;
  users: any;
  userIncomeSelected: any;
  statuses = ['Registrado', 'Aprobado'];
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  rol = '';
  claimNames: string[] = [];
  formType: string = 'mantenimiento';
  balanceByUser: any;

  constructor(
    private fb: FormBuilder,
    private incomesService: IncomesService,
    private userService: UserService,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private rolesService: RolesService,
    private balanceService: BalanceService,
    private notificationsService: NotificationsService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;

    this.incomesForm = this.fb.group({
      concept: ['Mensualidad', Validators.required],
      description: ['', [Validators.required]],
      amount: [0, Validators.required],
      userId: [null, Validators.required],
      status: ['Registrado', Validators.required],
      registeredBy: [this.tokenDecoded.id, Validators.required]
    });

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de servicio:', this.claimNames);
    });

    this.getIncomes();
    this.getUsers();
  }

  onSubmit(): void {
    var payload: any;

    if (this.formType == 'mantenimiento') {
      console.log("Form para ", this.incomesForm.value)
      payload = {
        Concept: this.incomesForm.value.concept.Concept,
        Description: this.incomesForm.value.concept.Description,
        Amount: this.incomesForm.value.concept.Amount,
        UserId: this.incomesForm.value.concept.UserId,
        Status: 'Registrado',
        RegisteredBy: this.tokenDecoded.id,
      };
    } else if (this.formType == 'otros') {
      payload = {
        Concept: this.incomesForm.value.concept,
        Description: this.incomesForm.value.description,
        Amount: this.incomesForm.value.amount,
        UserId: this.incomesForm.value.userId,
        Status: this.incomesForm.value.status,
        RegisteredBy: this.tokenDecoded.id,
      };
    }

    console.log("PAYLOAD", payload)

    this.incomesService.registerIncomes(payload).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.sendNotification('Se ha registrado un pago "' + payload.Concept + '", ' + payload.Description, payload.UserId);

        /* Actualiza estado de la cuota */
        this.balanceService.updateBalanceStatus(this.incomesForm.value.concept.RecordId, 'Entregado').subscribe({
          next: (response) => {
            console.log('Estado actualizado:', response);
          },
          error: (error) => {
            console.error('Error al actualizar el estado:', error);
            this.message = 'Error al actualizar el estado';
          }
        });


        this.message = 'Registro exitoso';
        this.snackBar.open('Ingreso registrado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });

        // Reset con valores por defecto
        this.incomesForm.reset({
          concept: 'Mensualidad',
          description: '',
          amount: 0,
          userId: null,
          status: 'Registrado',
          registeredBy: this.tokenDecoded.id,
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
  }



  updateStatus(income: any, newStatus: string) {
    console.log("INCOME", income)
    var newBalanceStatus = '';
    const updatedIncome = {
      ...income,
      Status: newStatus
    };

    if (newStatus == 'Aprobado') {
      newBalanceStatus = 'Pagado'
    } else if (newStatus == 'Registrado') {
      newBalanceStatus = 'Entregado'
    }

    this.incomesService.updateIncomeStatus(updatedIncome.IncomeId, newStatus, this.tokenDecoded.id).subscribe({
      next: (response) => {
        income.Status = newStatus;
        this.message = 'Estado actualizado correctamente';
        this.sendNotification('Se actualizó el estado de tu cuota "' + income.Concept + '", ' + income.Description, income.UserId);

        this.getIncomes();
      },
      error: (error) => {
        console.error('Error al actualizar el estado:', error);
        this.message = 'Error al actualizar el estado';
      }
    });

    this.balanceService.balanceByIncome(income.Description, income.Concept, income.Amount, income.UserId, newBalanceStatus).subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response);
      },
      error: (error) => {
        console.error('Error al actualizar el estado:', error);
        this.message = 'Error al actualizar el estado';
      }
    });



    /*       balanceByIncome(Description: any, Concept: any, Amount: any, UserId: any, Status: any ): Observable<any> {
     */

  }

  getDecodedAccessToken(accessToken: string): any {
    try {
      return jwtDecode(accessToken);
    } catch (Error) {
      var invalid = "Invalid user";
    }
  }

  getIncomes() {
    this.incomesService.getIncomes()
      .subscribe(
        (success) => {
          this.incomes = success.result
          this.updatePagination();
          console.log(this.incomes)
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getCuotasByUser(user: any) {
    console.log(user)

    this.balanceService.getBalanceById(user)
      .subscribe(
        (success) => {
          this.balanceByUser = success.data
          console.log("Deudas por ususario", success)
        },
        (error) => {
          console.log(error);
        }
      );
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

  deleteIncome(income: any) {
    const dialogRef = this.dialog.open(DeleteIncomesComponent, {
      width: '500px',
      data: { income }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteIncome(income.IncomeId, income);
      }
    });
  }

  confirmDeleteIncome(IncomeId: number, income: any) {
    var CreatedBy = '';

    this.userService.getFullUser(income.RegisteredBy).subscribe({
      next: (response) => {
        CreatedBy = response.success.FirstName + ' ' + response.success.Email;

        const payload = {
          Description: 'Concepto:' + income.Concept + ', Descripción:' + income.Description + ', Monto:' + income.Amount,
          Module: 'Ingresos',
          DeletedBy: 'Borrado por casa: ' + this.tokenDecoded.casa + ', ' + this.tokenDecoded.nombre,
          CreatedBy: 'Registró el ingreso: ' + CreatedBy,
          CreatedOn: income.Date,
          Notes: '',
        };

        this.incomesService.deleteHistory(payload).subscribe({
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

    this.incomesService.deleteIncomes(IncomeId).subscribe({
      next: (response) => {
        console.log('Ingreso eliminado:', response);
        this.message = 'Ingreso eliminado exitosamente';
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al eliminar el ingreso:', error);
        this.message = 'Error al eliminar el ingreso';
      }
    });
  }

  onTabChange(event: any): void {
    // Verifica si se seleccionó el tab de "Listado"
    if (event.index === 1) {
      this.getIncomes();
    }
  }

  filtrarPorFechas(): void {
    const inicio = this.fechaInicio ? this.fechaInicio.toISOString().split('T')[0] : null;
    const fin = this.fechaFin ? this.fechaFin.toISOString().split('T')[0] : null;

    this.incomesService.getIncomes(inicio, fin).subscribe(
      data => {
        this.incomes = data.result
        this.updatePagination();
      },
      error => {
        console.error('Error al obtener facturas:', error);
      }
    );
  }

  hasClaim(name: string): boolean {
    return this.claimNames.includes(name);
  }

  sendNotification(description: any, userId: any) {
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

  /* Paginador Bootstrap */
  pagedIncomes: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalPagesArray: number[] = [];

  updatePagination() {
    this.totalPages = Math.ceil(this.incomes.length / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedIncomes = this.incomes.slice(start, end);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }
}

