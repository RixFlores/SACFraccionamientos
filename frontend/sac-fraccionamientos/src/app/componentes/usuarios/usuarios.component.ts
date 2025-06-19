import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UserService } from 'src/app/servicios/user.service';
import { DeleteUserComponent } from '../dialogs/delete-user/delete-user.component';
import { EditUserComponent } from '../dialogs/edit-user/edit-user.component';

@Component({
  selector: 'usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent implements OnInit {
  users: any;
  registerForm!: FormGroup;
  message: string = '';

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      roleId: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      houseNumber: ['', Validators.required],
      residents: ['', [Validators.required, Validators.pattern("^[0-9]*$")]]
    });

    this.userService.getUsers()
      .subscribe(
        (success) => {
          this.users = success.success
          console.log(success)
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
        Password: this.registerForm.value.password, // o crea otro campo para esto
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
          this.registerForm.reset();
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

}
