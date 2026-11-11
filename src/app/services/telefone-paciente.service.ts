import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { ITelefonePaciente } from "../models/telefone-paciente.models";

@Injectable({
  providedIn: 'root',
})

export class TelefonePacienteService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/telefonePaciente';

  // TODOS OS STATUS
  buscaTelefonePaciente(id: number): Observable<ITelefonePaciente[]> {
    return this.http.get<ITelefonePaciente[]>(`${this.apiUrl}/${id}`);
  }
}
