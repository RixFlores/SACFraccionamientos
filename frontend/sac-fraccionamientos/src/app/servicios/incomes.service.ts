import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IncomesService {
  private baseUrl = 'http://localhost:3900/api/incomes';
  private baseUrlDeletedHistory = 'http://localhost:3900/api/deletedHistory';

  constructor(private http: HttpClient) { }

  registerIncomes(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  /* getIncomes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/incomes`);
  } */

  getIncomes(fechaInicio?: any, fechaFin?: any): Observable<any> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get(`${this.baseUrl}/incomes`, { params });
  }

  deleteIncomes(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  updateIncomes(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data);
  }

  getIncomesById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/income/${id}`);
  }

  deleteHistory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrlDeletedHistory}/register`, data);
  }

  updateIncomeStatus(id: number, newStatus: string, approvedBy: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/status/${id}/${newStatus}/${approvedBy}`, '');
  }
}
