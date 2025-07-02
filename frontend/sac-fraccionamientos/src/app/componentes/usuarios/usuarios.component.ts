import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/servicios/user.service';
import { DeleteUserComponent } from '../dialogs/delete-user/delete-user.component';
import { EditUserComponent } from '../dialogs/edit-user/edit-user.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolesService } from 'src/app/servicios/roles.service';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  users: any;
  registerForm!: FormGroup;
  message: string = '';
  roles: any;
  cookieUser: string = '';
  tokenDecoded: any;
  rol = '';
  claimNames: string[] = [];

  constructor(
    private userService: UserService,
    private cookieService: CookieService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private rolesService: RolesService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      roleId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      houseNumber: ['', Validators.required],
      residents: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
    });

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de servicio:', this.claimNames);
    });

    this.userService.getUsers()
      .subscribe(
        (success) => {
          this.users = success.success
          this.updatePagination();
          console.log(success)
        },
        (error) => {
          console.log(error);
        }
      );

    this.rolesService.getRoles()
      .subscribe(
        (success) => {
          this.roles = success.roles;
          console.log("ROLES", success)
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      const payload = {
        Email: this.registerForm.value.email,
        Password: this.registerForm.value.password,
        RoleId: this.registerForm.value.roleId,
        FirstName: this.registerForm.value.firstName,
        LastName: this.registerForm.value.lastName,
        HouseNumber: this.registerForm.value.houseNumber,
        Residents: this.registerForm.value.residents
      };

      this.userService.registerUser(payload).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);
          this.message = 'Registro exitoso';

          this.snackBar.open('Usuario registrado correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
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

  deleteUser(user: any) {
    const dialogRef = this.dialog.open(DeleteUserComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteUser(user.UserId);
      }
    });
  }

  confirmDeleteUser(userId: number) {
    console.log('Confirmar eliminación del usuario con ID:', userId);
    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        console.log('Usuario eliminado:', response);
        this.message = 'Usuario eliminado exitosamente';
        this.ngOnInit();
      },
      error: (error) => {
        console.error('Error al eliminar el usuario:', error);
        this.message = 'Error al eliminar el usuario';
      }
    });
  }

  editUser(user: any) {
    const dialogRef = this.dialog.open(EditUserComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmUpdateUser(user.UserId, result);
      }
    });
  }

  confirmUpdateUser(userId: number, user: any) {
    this.userService.updateUser(userId, user).subscribe({
      next: resp => {
        this.message = 'Usuario actualizado';
        this.ngOnInit();
      },
      error: err => this.message = 'Error actualizando: ' + (err.error?.msg || err.message)
    });
  }

  hasClaim(name: string): boolean {
    return this.claimNames.includes(name);
  }

  getDecodedAccessToken(accessToken: string): any {
    try {
      return jwtDecode(accessToken);
    } catch (Error) {
      var invalid = "Invalid user";
    }
  }


  /* Paginador Bootstrap */
  pagedUsers: any[] = [];
  currentPage = 1;
  pageSize = 5;
  totalPages = 0;
  totalPagesArray: number[] = [];

  updatePagination() {
    this.totalPages = Math.ceil(this.users.length / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedUsers = this.users.slice(start, end);
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
