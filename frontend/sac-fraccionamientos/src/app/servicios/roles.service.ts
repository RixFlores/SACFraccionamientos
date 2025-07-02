import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, switchMap } from 'rxjs';
import { url } from './url';

@Injectable({
    providedIn: 'root'
})
export class RolesService {
    private baseUrl = url + '/api/roles';

    constructor(private http: HttpClient) { }

    registerRole(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/register`, data);
    }

    getClaimsByRole(roleId: any): Observable<any> {
        console.log("ROL ID EN SERVICIO", roleId)
        return this.http.get(`${this.baseUrl}/claims/by-role/${roleId}`);
    }

    getRoles(): Observable<any> {
        return this.http.get(`${this.baseUrl}/roles`);
    }

    getRoleById(roleId: number): Observable<any> {
        return this.http.get(`${this.baseUrl}/roles/${roleId}`);
    }

    updateRole(roleId: number, data: any): Observable<any> {
        return this.http.put(`${this.baseUrl}/roles/${roleId}`, data);
    }

    deleteRole(roleId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/roles/${roleId}`);
    }

    createClaim(data: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/registerClaims`, data);
    }

    deleteClaim(claimId: number): Observable<any> {
        return this.http.delete(`${this.baseUrl}/deleteClaim/${claimId}`);
    }

    listOfClaims(rolName: string): Observable<string[]> {
        return this.getRoles().pipe(
            map((rolesResponse:any) => {
                const rol = rolesResponse.roles.find((r: any) => r.Name === rolName);
                return rol?.RoleId;
            }),
            switchMap((roleId:any) => {
                if (roleId == null) return of([]);
                return this.getClaimsByRole(roleId).pipe(
                    map((claimsResponse:any) => {
                        return claimsResponse?.claims?.map((c: any) => c.ClaimName) || [];
                    })
                );
            })
        );
    }
}
