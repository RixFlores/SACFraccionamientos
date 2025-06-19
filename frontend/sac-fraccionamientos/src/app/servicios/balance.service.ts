import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {
  private baseUrl = 'http://localhost:3900/api/balance';

  constructor(private http: HttpClient) { }

  registerBalance(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  getBalance(id:number): Observable<any> {
    return this.http.get(`${this.baseUrl}/balance/${id}`);
  } 
}
