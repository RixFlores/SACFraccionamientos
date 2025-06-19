import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-user',
  template: `
  <div style="padding:40px;">
    <h3 mat-dialog-title>Eliminar usuario:</h3>
    <div mat-dialog-content>
      <p>¿Seguro que deseas eliminar al usuario: <b> {{ data.user.FirstName }} {{ data.user.LastName }} </b> ?</p>
    </div>
    <div mat-dialog-actions>
      <button (click)="onNoClick()" class="btn btn-secondary" style="padding: 5px; margin-right: 10px;">Cancelar</button>
      <button (click)="onConfirm()" class="btn btn-danger" style="padding: 5px;">Confirmar</button>
    </div>
  </div>
`,
  standalone: false
})
export class DeleteUserComponent implements OnInit {

  ngOnInit(): void {
    console.log("DATA", this.data);
  }

  constructor(
    public dialogRef: MatDialogRef<DeleteUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any // Recibe los datos que pasan desde el componente padre
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(true); // Pasa "true" al componente padre cuando confirma la eliminación
  }
}
