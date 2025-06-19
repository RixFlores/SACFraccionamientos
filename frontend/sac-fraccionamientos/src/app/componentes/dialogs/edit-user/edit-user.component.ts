import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/servicios/user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {
  editForm!: FormGroup;
  person: any;

  roles = [
    { value: 1, label: 'Caseta' },
    { value: 2, label: 'Residente' },
    { value: 3, label: 'Directivo' }
  ];

  debtors = [
    'Yes',
    'No'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<EditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userService.getUserById(this.data.user.UserId).subscribe({
      next: (response) => {
        this.person = response.success;

        this.editForm = this.fb.group({
          email: [this.person.Email, [Validators.required, Validators.email]],
          password: [''],
          roleId: [this.person.RoleId, Validators.required],
          firstName: [this.data.user.FirstName, Validators.required],
          lastName: [this.data.user.LastName, Validators.required],
          houseNumber: [this.data.user.HouseNumber, [Validators.required, Validators.pattern("^[0-9]*$")]],
          residents: [this.data.user.Residents, [Validators.required, Validators.pattern("^[0-9]*$")]],
          Phone: [this.data.user.Phone, [Validators.required, Validators.pattern("^[0-9]*$")]],
          Debtor: [this.data.user.Debtor, Validators.required]
        });

        this.cdr.detectChanges(); // Para evitar errores de sincronización de vista
      },
      error: (error) => {
        console.error('Error al obtener el usuario:', error);
        this.dialogRef.close();
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.editForm.valid) {
      const updated = {
        ...this.data.user,
        Email: this.editForm.value.email,
        ...(this.editForm.value.password ? { Password: this.editForm.value.password } : {}),
        RoleId: this.editForm.value.roleId,
        FirstName: this.editForm.value.firstName,
        LastName: this.editForm.value.lastName,
        HouseNumber: this.editForm.value.houseNumber,
        Residents: this.editForm.value.residents,
        Phone: this.editForm.value.Phone,
        Debtor: this.editForm.value.Debtor
      };
      console.log('Datos actualizados:', updated);
      this.dialogRef.close(updated);
    }
  }
}
