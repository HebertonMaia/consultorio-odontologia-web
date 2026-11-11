import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IEspecialidade } from "../models/especialidade.models";


@Injectable({
  providedIn: 'root',
})

export class EspecialidadeService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}api/especialidade`;

  listar(): Observable<IEspecialidade[]> {
    return this.http.get<IEspecialidade[]>(this.apiUrl);
  }
}
