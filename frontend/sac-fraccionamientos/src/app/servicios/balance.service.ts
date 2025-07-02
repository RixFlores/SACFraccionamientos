import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { url } from './url';

@Injectable({
  providedIn: 'root'
})
export class BalanceService {

/*   private baseUrl = 'http://189.161.179.239:3900/api/balance'; */
 private baseUrl = url+'/api/balance';

  constructor(private http: HttpClient) { }

  registerBalance(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  registerBalanceForOne(id:any, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/registerForOne/${id}`, data);
  }

  getBalance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/balance`);
  } 

  getBalanceById(id:number): Observable<any> {
    return this.http.get(`${this.baseUrl}/balanceId/${id}`);
  }   
  
  updateBalanceStatus(id: number, newStatus: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/status/${id}/${newStatus}`, '');
  }
  
   deleteBalance(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  balanceByIncome(Description: any, Concept: any, Amount: any, UserId: any, Status: any ): Observable<any> {
    return this.http.put(`${this.baseUrl}/balanceByIncome/${Description}/${Concept}/${Amount}/${UserId}/${Status}`, '');
  }
}
