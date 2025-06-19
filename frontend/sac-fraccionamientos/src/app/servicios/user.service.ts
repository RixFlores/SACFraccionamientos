import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:3900/api/user';

  constructor(private http: HttpClient) {}

  registerUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  login(credentials:any): Observable<any> {
    console.log("CREDENCIALES EN SERVICIO", credentials)
    return this.http.post(`${this.baseUrl}/login`,credentials)
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  updateUser(id: number, data: any): Observable<any> {
    console.log("DATA EN SERVICIO", data)
    console.log("ID EN SERVICIO", id)
    return this.http.put(`${this.baseUrl}/update/${id}`, data);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${id}`);
  }
  
  getFullUser(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/fullUser/${id}`);
  }

}
