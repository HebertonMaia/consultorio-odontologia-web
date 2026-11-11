import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../../environments/environment";
import { IAuth } from "../../dto/Auth/auth.dto";
import { IAutenticado } from "../../dto/Auth/autenticado.dto";

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/Auth';

  login(authDto: IAuth): Observable<IAutenticado> {
    return this.http.post<IAutenticado>(this.apiUrl + '/login', authDto);
  }
}
