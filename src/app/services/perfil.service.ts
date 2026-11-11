import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IPerfil } from "../models/perfil.models";

@Injectable({
  providedIn: 'root',
})

export class PerfilService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/perfil';

  listar(): Observable<IPerfil[]> {
      return this.http.get<IPerfil[]>(this.apiUrl);
    }
}
