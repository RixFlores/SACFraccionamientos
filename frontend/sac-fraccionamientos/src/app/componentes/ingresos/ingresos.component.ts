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

  constructor(
    private fb: FormBuilder,
    private incomesService: IncomesService,
    private userService: UserService,
    private cookieService: CookieService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    
    console.log("tokenDecoded", this.tokenDecoded)

    this.incomesForm = this.fb.group({
      concept: ['Mensualidad', Validators.required],
      description: ['', [Validators.required]],
      amount: [0, Validators.required],
      userId: [null, Validators.required],
      status: ['Registrado', Validators.required],
      registeredBy: [this.tokenDecoded.id, Validators.required]
    });


    this.getIncomes();
    this.getUsers();
  }

  onSubmit(): void {
    if (this.incomesForm.valid) {
      this.createIncome();
    } else {
      console.log('Formulario inválido');
      console.log(this.incomesForm)
      this.message = 'Formulario inválido';
    }
  }

  createIncome(): void {
    const payload = {
      Concept: this.incomesForm.value.concept,
      Description: this.incomesForm.value.description,
      Amount: this.incomesForm.value.amount,
      UserId: this.incomesForm.value.userId,
      Status: this.incomesForm.value.status,
      RegisteredBy: this.tokenDecoded.id,
    };

    this.incomesService.registerIncomes(payload).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.message = 'Registro exitoso';
        this.incomesForm.reset({
          concept: 'Mensualidad',
          description: '',
          amount: 0,
          userId: null,
          status: 'Registrado',
          registeredBy: this.tokenDecoded.id,
        });
      },
      error: (error) => {
        console.error('Error al registrar:', error);
        this.message = error.error?.msg ? `Error: ${error.error.msg}` : 'Error desconocido en el registro';
      }
    });
  }

  updateStatus(income: any, newStatus: string) {
    const updatedIncome = {
      ...income,
      Status: newStatus
    };

    this.incomesService.updateIncomeStatus(updatedIncome.IncomeId, newStatus, this.tokenDecoded.id).subscribe({
      next: (response) => {
        income.Status = newStatus;
        this.message = 'Estado actualizado correctamente';
        this.getIncomes();
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

  getIncomes() {
    this.incomesService.getIncomes()
      .subscribe(
        (success) => {
          this.incomes = success.result
          console.log(this.incomes)
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
        console.log("INICIO", inicio);
        console.log("FIN", fin);
        console.log('Facturas: ', data);
      },
      error => {
        console.error('Error al obtener facturas:', error);
      }
    );
  }

}

