import { Component, OnInit } from '@angular/core';
import { BillsService } from 'src/app/servicios/bills.service';
import { IncomesService } from 'src/app/servicios/incomes.service';

@Component({
  selector: 'finances-resume',
  templateUrl: './finances-resume.component.html',
  styleUrls: ['./finances-resume.component.css']
})
export class FinancesResumeComponent implements OnInit {
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  incomes: any;
  bills: any;
  totalIncommes: number = 0;
  totalBills: number = 0;


  constructor(
    private incomesService: IncomesService,
    private billsService: BillsService,
  ) { }

  ngOnInit(): void {

  }


  filtrarPorFechas(): void {
    const inicio = this.fechaInicio ? this.fechaInicio.toISOString().split('T')[0] : null;
    const fin = this.fechaFin ? this.fechaFin.toISOString().split('T')[0] : null;

    this.getIncomes(inicio, fin);
    this.getBills(inicio, fin);
  }

  getIncomes(inicio: string | null, fin: string | null): void {
    this.incomesService.getIncomes(inicio, fin).subscribe(
      data => {
        this.incomes = data.result
        for (let index = 0; index < this.incomes.length; index++) {
          this.totalIncommes = this.totalIncommes + this.incomes[index].Amount;
        }
      },
      error => {
        console.error('Error al obtener facturas:', error);
      }
    );
  }

  getBills(inicio: string | null, fin: string | null): void {
    this.billsService.getBills(inicio, fin).subscribe(
      data => {
        this.bills = data.result
        for (let index = 0; index < this.bills.length; index++) {
          this.totalBills = this.totalBills + this.bills[index].Amount;
        }
      },
      error => {
        console.error('Error al obtener facturas:', error);
      }
    );
  }

}
