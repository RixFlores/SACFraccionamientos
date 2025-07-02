import { Component, OnInit } from '@angular/core';
import { RolesService } from 'src/app/servicios/roles.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DeleteRolesComponent } from '../dialogs/delete-roles/delete-roles.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  newRoleName: string = '';
  createdRoleId: number | null = null;
  roleForm!: FormGroup;

  predefinedClaims = [
    { name: 'Ver usuarios', selected: false },
    { name: 'Crear Usuarios', selected: false },
    { name: 'Borrar Usuarios', selected: false },
    { name: 'Actualizar Usuarios', selected: false },
  ];

  predefinedClaimsList = [
    'Usuarios',
    'Ver Usuarios',
    'Crear Usuarios',
    'Actualizar Usuarios',
    'Borrar Usuarios',

    'Cuotas',
    'Ver Cuotas',
    'Crear Cuotas',
    'Actualizar Cuotas',
    'Eliminar Cuotas',

    'Gastos',
    'Ver Gastos',
    'Crear Gastos',
    'Actualizar Gastos',
    'Eliminar Gastos',

    'Ingresos',
    'Ver Ingresos',
    'Crear Ingresos',
    'Actualizar Ingresos',
    'Eliminar Ingresos',

    'Resumen',
    'Ver Resumen',

    'Visitas',
    'Ver Visitas',
    'Crear Visitas',
    'Actualizar Visitas',
    'Eliminar Visitas',

    'Comentarios',
    'Ver Comentarios',
    'Crear Comentarios',
    'Actualizar Comentarios',
    'Eliminar Comentarios',

    'Roles',
    'Ver Roles',
    'Crear Roles',
    'Actualizar Roles',
    'Eliminar Roles',

    'Multas',
    'Ver Multas',
    'Crear Multas',
    'Actualizar Multas',
    'Eliminar Multas',

    'Notificaciones',
    'Ver Notificaciones',
    'Crear Notificaciones',
    'Actualizar Notificaciones',
    'Eliminar Notificaciones',

  ];

  rolesWithClaims: any[] = [];
  cookieUser: string = '';
  tokenDecoded: any;
  rol = '';
  claimNames: string[] = [];

  constructor(
    private rolesService: RolesService,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cookieService: CookieService,
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    this.rol = this.tokenDecoded.rol;

    this.rolesService.listOfClaims(this.rol).subscribe((names) => {
      this.claimNames = names;
      console.log('Claims de servicio:', this.claimNames);
    });

    this.roleForm = this.fb.group({
      rol: ['', Validators.required]
    });

    this.loadRolesWithClaims();
  }

  createRole() {
    if (this.roleForm.invalid) return;

    const roleName = this.roleForm.value.rol;

    this.rolesService.registerRole({ Name: roleName }).subscribe({
      next: (res: any) => {
        this.createdRoleId = res.RoleId;
        this.snackBar.open('Rol creado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.assignClaims(res.RoleId);
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  assignClaims(roleId: number = this.createdRoleId!) {
    const selectedClaims = this.predefinedClaims.filter(c => c.selected);
    const requests = selectedClaims.map(claim =>
      this.rolesService.createClaim({ Name: claim.name, RoleId: roleId })
    );

    Promise.all(requests.map(req => req.toPromise()))
      .then(() => {
        this.loadRolesWithClaims();
        this.predefinedClaims.forEach(c => (c.selected = false));
        this.roleForm.reset();
        this.createdRoleId = null;
      })
      .catch(err => console.error('Error asignando claims:', err));
  }

  loadRolesWithClaims() {
    this.rolesWithClaims = [];

    this.rolesService.getRoles().subscribe({
      next: (res) => {
        res.roles.forEach((role: any) => {
          this.rolesService.getClaimsByRole(role.RoleId).subscribe({
            next: (claimsRes) => {
              const currentClaims = claimsRes.claims.map((c: any) => c.ClaimName);

              const editableClaims = this.predefinedClaimsList.map(name => ({
                name,
                selected: currentClaims.includes(name)
              }));

              this.rolesWithClaims.push({
                roleId: role.RoleId,
                name: role.Name,
                claims: claimsRes.claims,
                claimsEditable: editableClaims
              });
            },
            error: (err) => console.error('Error al obtener claims por rol:', err)
          });
        });
      },
      error: (err) => console.error('Error al obtener roles:', err)
    });
  }

  saveClaims(role: any) {
    const selectedClaims = role.claimsEditable.filter((c: any) => c.selected);
    const unselectedClaims = role.claimsEditable.filter((c: any) => !c.selected);

    this.rolesService.getClaimsByRole(role.roleId).subscribe({
      next: (res) => {
        const existingClaims = res.claims.map((c: any) => c.ClaimName);
        const toAdd = selectedClaims.filter((c: any) => !existingClaims.includes(c.name));
        const toDelete = res.claims.filter((c: any) => unselectedClaims.find((u: any) => u.name === c.ClaimName));

        const addRequests = toAdd.map((claim: any) =>
          this.rolesService.createClaim({ Name: claim.name, RoleId: role.roleId }).toPromise()
        );

        const deleteRequests = toDelete.map((claim: any) =>
          this.rolesService.deleteClaim(claim.ClaimId).toPromise()
        );

        Promise.all([...addRequests, ...deleteRequests])
          .then(() => {
            this.snackBar.open('Permisos agregados correctamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['snackbar-success']
            });
            this.loadRolesWithClaims();
          })
          .catch((err) => console.error('Error al guardar claims:', err));
      },
      error: (err) => console.error('Error al obtener claims existentes:', err)
    });
  }




  deleteRole(roleId: any) {
    const dialogRef = this.dialog.open(DeleteRolesComponent, {
      width: '500px',
      data: { roleId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmDeleteRol(roleId);
      }
    });

  }

  confirmDeleteRol(roleId: any) {
    this.rolesService.deleteRole(roleId.roleId).subscribe({
      next: (res) => {
        this.snackBar.open('Rol eliminado correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
        this.loadRolesWithClaims();
      },
      error: (err) => {
        console.error('Error al eliminar rol:', err);
        this.snackBar.open(`Error: ${err}`, 'Cerrar', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      }
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
}

