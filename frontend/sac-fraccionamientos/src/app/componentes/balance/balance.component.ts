import { Component, OnInit } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CookieService } from 'ngx-cookie-service';
import { BalanceService } from 'src/app/servicios/balance.service';

@Component({
  selector: 'balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent implements OnInit {
  balance: any;
  cookieUser: string = '';
  tokenDecoded: any;

  constructor(
    private balanceService: BalanceService,
    private cookieService: CookieService,
  ) { }

  ngOnInit(): void {
    this.cookieUser = this.cookieService.get('accessToken');
    this.tokenDecoded = this.getDecodedAccessToken(this.cookieUser);
    console.log("Token",this.tokenDecoded);
    this.balanceService.getBalance(this.tokenDecoded.id)
      .subscribe(
        (success) => {
          console.log(success);
          this.balance = success.data
          console.log(this.balance)
        },
        (error) => {
          console.log(error);
        }
      );
  }

  generateBills() {
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const mesActual = new Date().getMonth(); // 0-11
    const nombreMes = meses[mesActual];

    const payload = {
      Amount: 300,
      Description: "Mensualidad de " + nombreMes,
      Concept: "Mensualidad",
      Notes: "",
      Status: "Pendiente",
    };

    this.balanceService.registerBalance(payload)
      .subscribe(
        (success) => {
          console.log(success);
          alert("Las facturas se han generado correctamente");
        },
        (error) => {
          console.log(error);
          alert("Error al generar las facturas");
        }
      );
  }

  getDecodedAccessToken(accessToken: string): any {
    try {
      return jwtDecode(accessToken);
    } catch (Error) {
      var invalid = "Invalid user";
    }
  }


}
