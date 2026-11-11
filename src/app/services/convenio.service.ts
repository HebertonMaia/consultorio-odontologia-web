import { IConvenio } from './../models/convenio.models';
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IConvenioSalvarDto } from "../dto/convenio-salvar.dto";

@Injectable({
  providedIn: 'root',
})

export class ConvenioService {
  // inject() pede ao Angular uma instância do HttpClient (injeção de dependência).
  // É o jeito moderno; o antigo era receber pelo constructor. Os dois funcionam.
  private readonly http = inject(HttpClient);

  // Endereço do recurso. Por enquanto fixo aqui; depois vamos mover
  // para um arquivo de configuração (environment) para trocar pela API .NET.
  private readonly apiUrl = `${environment.apiUrl}api/convenio`;

  // GET /dentistas → lista todos
  listar(): Observable<IConvenio[]>{
    return this.http.get<IConvenio[]>(this.apiUrl);
  }

  // GET /dentista → por id
  buscarPorId(id: number | string): Observable<IConvenio>{
    return this.http.get<IConvenio>(`${this.apiUrl}/${id}`);
  }

  incluirNovo(dentistaNovo: IConvenioSalvarDto): Observable<IConvenio>{
    return this.http.post<IConvenio>(this.apiUrl, dentistaNovo);
  }

  atualizar(dentistaId: number | string, dentistaNovo: IConvenioSalvarDto): Observable<IConvenio>{
    return this.http.put<IConvenio>(`${this.apiUrl}/${dentistaId}`, dentistaNovo);
  }
}
