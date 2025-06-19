import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { LoginComponent } from './componentes/login/login.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; 
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { DashboardComponent } from './componentes/dashboard/dashboard.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UsuariosComponent } from './componentes/usuarios/usuarios.component';
import { GastosComponent } from './componentes/gastos/gastos.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AppRoutingModule } from './app-routing.module';
import { IngresosComponent } from './componentes/ingresos/ingresos.component';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { VisitsComponent } from './componentes/visits/visits.component';
import { ReglamentoComponent } from './componentes/reglamento/reglamento.component';
import { ContactsComponent } from './componentes/contacts/contacts.component';
import { EditUserComponent } from './componentes/dialogs/edit-user/edit-user.component';
import { DeleteUserComponent } from './componentes/dialogs/delete-user/delete-user.component';
import { EditIncomesComponent } from './componentes/dialogs/edit-incomes/edit-incomes.component';
import { DeleteIncomesComponent } from './componentes/dialogs/delete-incomes/delete-incomes.component';
import { EditBillsComponent } from './componentes/dialogs/edit-bills/edit-bills.component';
import { DeleteBillsComponent } from './componentes/dialogs/delete-bills/delete-bills.component';
import { EditVisitorsComponent } from './componentes/dialogs/edit-visitors/edit-visitors.component';
import { DeleteVisitorsComponent } from './componentes/dialogs/delete-visitors/delete-visitors.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BalanceComponent } from './componentes/balance/balance.component';
import { NotFoundComponent } from './componentes/not-found/not-found.component';
import { CommentsComponent } from './componentes/comments/comments.component';
import { DeleteCommentsComponent } from './componentes/dialogs/delete-comments/delete-comments.component';
import { FinancesResumeComponent } from './componentes/finances-resume/finances-resume.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    UsuariosComponent,
    GastosComponent,
    IngresosComponent,
    VisitsComponent,
    ReglamentoComponent,
    ContactsComponent,
    EditUserComponent,
    DeleteUserComponent,
    EditIncomesComponent,
    DeleteIncomesComponent,
    EditBillsComponent,
    DeleteBillsComponent,
    EditVisitorsComponent,
    DeleteVisitorsComponent,
    BalanceComponent,
    NotFoundComponent,
    CommentsComponent,
    DeleteCommentsComponent,
    FinancesResumeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatOptionModule,
    MatSelectModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
