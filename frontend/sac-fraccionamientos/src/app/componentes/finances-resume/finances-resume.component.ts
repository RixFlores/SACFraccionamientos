import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BillsService } from 'src/app/servicios/bills.service';
import { IncomesService } from 'src/app/servicios/incomes.service';

@Component({
  selector: 'finances-resume',
  templateUrl: './finances-resume.component.html',
  styleUrls: ['./finances-resume.component.css']
})

export class FinancesResumeComponent implements OnInit {
  @ViewChild('chartContainer') chartContainer!: ElementRef;
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  incomes: any;
  bills: any;
  totalIncommes: number = 0;
  totalBills: number = 0;

  chartData: any[] = [];
  chartOptions: any;

  private incomesLoaded = false;
  private billsLoaded = false;

  constructor(
    private incomesService: IncomesService,
    private billsService: BillsService,
  ) { }

  ngOnInit(): void {
    this.setChartOptions();
  }

  ngAfterViewInit(): void {
    this.updateChartSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.updateChartSize();
  }

  filtrarPorFechas(): void {
    this.totalIncommes = 0;
    this.totalBills = 0;
    this.incomesLoaded = false;
    this.billsLoaded = false;

    const inicio = this.fechaInicio ? this.fechaInicio.toISOString().split('T')[0] : null;
    const fin = this.fechaFin ? this.fechaFin.toISOString().split('T')[0] : null;

    this.getIncomes(inicio, fin);
    this.getBills(inicio, fin);
  }

  getIncomes(inicio: string | null, fin: string | null): void {
    this.incomesService.getIncomes(inicio, fin).subscribe(
      data => {
        this.incomes = data.result;
        this.totalIncommes = this.incomes.reduce((sum: number, income: any) => sum + income.Amount, 0);
        this.incomesLoaded = true;
        this.tryUpdateChart();
      },
      error => {
        console.error('Error al obtener ingresos:', error);
      }
    );
  }

  getBills(inicio: string | null, fin: string | null): void {
    this.billsService.getBills(inicio, fin).subscribe(
      data => {
        this.bills = data.result;
        this.totalBills = this.bills.reduce((sum: number, bill: any) => sum + bill.Amount, 0);
        this.billsLoaded = true;
        this.tryUpdateChart();
      },
      error => {
        console.error('Error al obtener gastos:', error);
      }
    );
  }
  tryUpdateChart(): void {
    if (this.incomesLoaded && this.billsLoaded) {
      this.updateChart();
    }
  }

  updateChart(): void {
    this.chartData = [
      { name: 'Ingresos', value: this.totalIncommes },
      { name: 'Gastos', value: this.totalBills }
    ];
  }

  setChartOptions(): void {
    this.chartOptions = {
      view: [500, 300], // valor inicial, se actualiza después
      legend: true,
      showLabels: true,
      animations: true,
      xAxis: true,
      yAxis: true,
      showYAxisLabel: true,
      showXAxisLabel: true,
      colorScheme: {
        domain: ['#4caf50', '#f44336']
      },
      legendPosition: 'right'
    };
  }

  updateChartSize(): void {
    if (!this.chartContainer) return;
    const containerWidth = this.chartContainer.nativeElement.clientWidth;

    // Ajusta el tamaño del gráfico al ancho del contenedor y altura fija o proporcional
    this.chartOptions.view = [containerWidth, 300];
  }


  downloadPDF() {
    const doc = new jsPDF();

    // === INGRESOS ===
    doc.text('Listado de Ingresos', 14, 10);

    const ingresosColumns = [
      { header: '#', dataKey: 'IncomeId' },
      { header: 'Aportador', dataKey: 'UserFullName' },
      { header: 'Concepto', dataKey: 'Description' },
      { header: 'Monto', dataKey: 'Amount' },
      { header: 'Fecha', dataKey: 'Date' }
    ];

    const ingresosData = (this.incomes || []).map((income: any) => ({
      IncomeId: income.IncomeId,
      UserFullName: income.UserFullName,
      Description: income.Description,
      Amount: `$${income.Amount.toFixed(2)}`,
      Date: new Date(income.Date).toLocaleDateString('es-MX')
    }));

    autoTable(doc, {
      head: [ingresosColumns.map(c => c.header)],
      body: ingresosData.map((item:any) => ingresosColumns.map(c => item[c.dataKey])),
      startY: 20,
    });

    // === GASTOS ===
    const finalY = (doc as any).lastAutoTable.finalY || 30; // última posición Y de la tabla anterior
    doc.text('Listado de Gastos', 14, finalY + 10);

    const gastosColumns = [
      { header: '#', dataKey: 'billId' },
      { header: 'Registró', dataKey: 'UserFullName' },
      { header: 'Concepto', dataKey: 'description' },
      { header: 'Monto', dataKey: 'Amount' },
      { header: 'Fecha', dataKey: 'Date' }
    ];

    const gastosData = (this.bills || []).map((bill: any) => ({
      billId: bill.billId,
      UserFullName: bill.UserFullName,
      description: bill.description,
      Amount: `$${bill.Amount.toFixed(2)}`,
      Date: new Date(bill.Date).toLocaleDateString('es-MX')
    }));

    autoTable(doc, {
      head: [gastosColumns.map(c => c.header)],
      body: gastosData.map((item:any) => gastosColumns.map(c => item[c.dataKey])),
      startY: finalY + 15,
    });

    doc.save('ingresos-y-gastos.pdf');
  }

}