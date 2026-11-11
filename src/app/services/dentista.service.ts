import { IDentistaConsultarDto } from '../dto/Dentista/dentista-consultar.dto';
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IDentista } from '../models/dentista.models'
import { IDentistaSalvarDto } from "../dto/Dentista/dentista-salvar.dto";

@Injectable({
  providedIn: 'root',
})

export class DentistaService {
  // inject() pede ao Angular uma instância do HttpClient (injeção de dependência).
  // É o jeito moderno; o antigo era receber pelo constructor. Os dois funcionam.
  private readonly http = inject(HttpClient);

  // Endereço do recurso. Por enquanto fixo aqui; depois vamos mover
  // para um arquivo de configuração (environment) para trocar pela API .NET.
  private readonly apiUrl = `${environment.apiUrl}api/dentista`;

  // GET /dentistas → lista todos
  listar(): Observable<IDentista[]>{
    return this.http.get<IDentista[]>(this.apiUrl);
  }

  listarFiltros(dto: IDentistaConsultarDto): Observable<IDentista[]>{
    return this.http.post<IDentista[]>(this.apiUrl + '/filtros', dto);
  }

  // GET /dentista → por id
  buscarPorId(id: number | string): Observable<IDentista>{
    return this.http.get<IDentista>(`${this.apiUrl}/${id}`);
  }

  incluirNovo(dentistaNovo: IDentistaSalvarDto): Observable<IDentista>{
    return this.http.post<IDentista>(this.apiUrl, dentistaNovo);
  }

  atualizar(dentistaId: number | string, dentistaNovo: IDentistaSalvarDto): Observable<IDentista>{
    return this.http.put<IDentista>(`${this.apiUrl}/${dentistaId}`, dentistaNovo);
  }
}
