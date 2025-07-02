import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { url } from './url';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private baseUrl = url+'/api/comments';

  constructor(private http: HttpClient) { }

  registerComments(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  getComments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/comments`);
  }

  deleteComment(id: number): Observable<any> {
    console.log("ID", id);
    return this.http.delete(`${this.baseUrl}/deleteComments/${id}`);
  }
  
}
