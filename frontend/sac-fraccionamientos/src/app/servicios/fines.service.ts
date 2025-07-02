import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, switchMap } from 'rxjs';
import { url } from './url';

@Injectable({
    providedIn: 'root'
})
export class FinesService {
    private baseUrl = url + '/api/fines';

    constructor(private http: HttpClient) { }

    registerFine(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/register`, data);
    }

    getFines(): Observable<any> {
        return this.http.get(`${this.baseUrl}/fines`);
    }

    updateFines(fineId: number, data: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/fines/${fineId}`, data);
    }

    deleteFine(fineId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/${fineId}`);
    }

}
