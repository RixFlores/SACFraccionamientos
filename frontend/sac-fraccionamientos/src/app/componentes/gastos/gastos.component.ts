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
registerLocaleData(localeEs, 'es');

@Component({
  selector: 'gastos',
  templateUrl: './gastos.component.html',
  styleUrls: ['./gastos.component.css']
})
export class GastosComponent implements OnInit {
  billsForm!: FormGroup;
  message: string = '';
  cookieUser: string = '';
  tokenDecoded: any;
  bills: any;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;

  constructor(
    private fb: FormBuilder,
    private billsService: BillsService,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private userService: UserService,
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    console.log("tokenDecoded", this.tokenDecoded)

    this.billsForm = this.fb.group({
      description: ['', [Validators.required]],
      amount: ['', Validators.required]
    });
    this.getBills();
  }

  onSubmit(): void {
    if (this.billsForm.valid) {
      const payload = {
        description: this.billsForm.value.description,
        amount: this.billsForm.value.amount,
        UserId: this.tokenDecoded.id,
        Status: 'Registrado',
        RegisteredBy: this.tokenDecoded.id
      };

      this.billsService.registerBills(payload).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.message = 'Registro exitoso';
          this.billsForm.reset();
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

  updateStatus(bill: any, newStatus: string) {

    this.billsService.updateBillsStatus(bill.billId, newStatus, this.tokenDecoded.id).subscribe({
      next: (response) => {
        console.log('Estado actualizado:', response);
        this.getBills(); // Recarga la lista
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


  getBills() {
    this.billsService.getBills()
      .subscribe(
        (success) => {
          this.bills = success.result
          console.log(this.bills)
        },
        (error) => {
          console.log(error);
        }
      );
  }

  deleteBill(bill: any) {
    const dialogRef = this.dialog.open(DeleteBillsComponent, {
      width: '500px',
      data: { bill }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteBills(bill.billId, bill);
      }
    });
  }

  confirmDeleteBills(billId: number, bill: any) {
    var CreatedBy = '';

    this.userService.getFullUser(bill.UserId).subscribe({
      next: (response) => {
        CreatedBy = response.success.FirstName + ' ' + response.success.Email;

        const payload = {
          Description: ' Descripción:' + bill.description + ', Monto:' + bill.Amount,
          Module: 'Gastos',
          DeletedBy: 'Borrado por casa: ' + this.tokenDecoded.casa + ', ' + this.tokenDecoded.nombre,
          CreatedBy: 'Registró el gasto: ' + CreatedBy,
          CreatedOn: bill.Date,
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

    this.billsService.deleteBills(billId).subscribe({
      next: (response) => {
        console.log('Gasto eliminado:', response);
        this.message = 'Gasto eliminado exitosamente';
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al eliminar el gasto:', error);
        this.message = 'Error al eliminar el gasto';
      }
    });
  }

  filtrarPorFechas(): void {
    const inicio = this.fechaInicio ? this.fechaInicio.toISOString().split('T')[0] : null;
    const fin = this.fechaFin ? this.fechaFin.toISOString().split('T')[0] : null;

    this.billsService.getBills(inicio, fin).subscribe(
      data => {
        this.bills = data.result
        console.log("INICIO", inicio);
        console.log("FIN", fin);
        console.log('Facturas: ', data);
      },
      error => {
        console.error('Error al obtener facturas:', error);
      }
    );
  }

  onTabChange(event: any): void {
    // Verifica si se seleccionó el tab de "Listado"
    if (event.index === 1) {
      this.getBills();
    }
  }
}
