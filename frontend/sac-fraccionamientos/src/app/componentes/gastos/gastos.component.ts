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
  rol = '';
  claimNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private billsService: BillsService,
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

    this.billsForm = this.fb.group({
      description: ['', [Validators.required]],
      amount: ['', Validators.required]
    });

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de servicio:', this.claimNames);
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
          this.updatePagination();
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
  
  hasClaim(name: string): boolean {
    return this.claimNames.includes(name);
  }

  
  /* Paginador Bootstrap */
  pagedBills: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalPagesArray: number[] = [];

  updatePagination() {
    this.totalPages = Math.ceil(this.bills.length / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedBills = this.bills.slice(start, end);
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
