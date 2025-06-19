import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BillsService {
  private baseUrl = 'http://localhost:3900/api/bills';
  private baseUrlDeletedHistory = 'http://localhost:3900/api/deletedHistory';

  constructor(private http: HttpClient) { }

  registerBills(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  /* getBills(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bills`);
  }  */

  getBills(fechaInicio?: any, fechaFin?: any): Observable<any> {
    let params = new HttpParams();

    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this.http.get(`${this.baseUrl}/bills`, { params });
  }

  deleteBills(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  updateBills(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data);
  }

  getBillsById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/bill/${id}`);
  }

  deleteHistory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrlDeletedHistory}/register`, data);
  }

  updateBillsStatus(id: number, newStatus: string, approvedBy: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/status/${id}/${newStatus}/${approvedBy}`, '');
  }

}
