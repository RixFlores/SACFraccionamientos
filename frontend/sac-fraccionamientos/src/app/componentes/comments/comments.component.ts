import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { CommentsService } from 'src/app/servicios/comments.service';
import { DeleteCommentsComponent } from '../dialogs/delete-comments/delete-comments.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RolesService } from 'src/app/servicios/roles.service';

@Component({
  selector: 'comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  CommentsForm!: FormGroup;
  comments: any;
  cookieUser: string = '';
  tokenDecoded: any;
  rol = '';
  claimNames: string[] = [];

  constructor(
    private fb: FormBuilder,
    private commentsService: CommentsService,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private rolesService: RolesService
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;

    this.CommentsForm = this.fb.group({
      Title: ['', [Validators.required]],
      Message: ['', Validators.required]
    });

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de comentarios:', this.claimNames);
    });
    this.getComments();
  }

  getComments(): void {
    this.commentsService.getComments()
      .subscribe(
        (success) => {
          this.comments = success.result
          console.log(this.comments)
        },
        (error) => {
          console.log(error);
        }
      );
  }

  onSubmit(): void {
    if (this.CommentsForm.valid) {
      const payload = {
        UserId: this.tokenDecoded.id,
        Title: this.CommentsForm.value.Title,
        Message: this.CommentsForm.value.Message
      };

      this.commentsService.registerComments(payload).subscribe({
        next: (response) => {
          console.log('Registro exitoso:', response);

          this.snackBar.open('Comentario enviado correctamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['snackbar-success']
          });

          this.CommentsForm.reset();
          this.CommentsForm.markAsPristine();
          this.CommentsForm.markAsUntouched();
          this.CommentsForm.updateValueAndValidity();
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          const errorMsg = error.error?.msg || 'Error desconocido al enviar el comentario';

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

      this.snackBar.open('Por favor completa todos los campos requeridos.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['snackbar-warning']
      });
    }
  }

  deleteComment(comment: any) {
    const dialogRef = this.dialog.open(DeleteCommentsComponent, {
      width: '500px',
      data: { comment }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteBills(comment.RecordId);
      }
    });
  }

  confirmDeleteBills(commentId: number) {

    this.commentsService.deleteComment(commentId).subscribe({
      next: (response) => {
        console.log('Comentario eliminado:', response);
        this.getComments();
      },
      error: (error) => {
        console.error('Error al eliminar el comentario:', error);
      }
    });
  }

  onTabChange(event: any): void {
    // Verifica si se seleccionó el tab de "Listado"
    if (event.index === 1) {
      this.getComments();
    }
  }

  getDecodedAccessToken(accessToken: string): any {
    try {
      return jwtDecode(accessToken);
    } catch (Error) {
      var invalid = "Invalid user";
    }
  }
  
  hasClaim(name: string): boolean {
    return this.claimNames.includes(name);
  }
}
