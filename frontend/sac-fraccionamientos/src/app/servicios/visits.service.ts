import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { url } from './url';

@Injectable({
  providedIn: 'root'
})
export class VisitsService {

  private baseUrl = url+'/api/visits';

  constructor(private http: HttpClient) {}

  registerVisit(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  getVisits(): Observable<any> {
    return this.http.get(`${this.baseUrl}/visits`);
  }

  deleteVisits(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  updateVisits(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data);
  }

  getVisitsById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/visit/${id}`);
  }

   updateVisitStatus(id: number, newStatus: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/status/${id}/${newStatus}`, '');
  }

}