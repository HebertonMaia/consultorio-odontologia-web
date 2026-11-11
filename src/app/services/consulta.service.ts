import { IConsultaAgendaDto } from '../dto/Agenda/agenda-consulta.dto';
import { Inject, Injectable, inject, runInInjectionContext } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IConsulta } from "../models/consulta.models";
import { IConsultarConsultaPorDentista } from "../dto/Agenda/consultar-consulta-por-dentista.dto";
import { IFiltroConsultarAgendaDto } from '../dto/Agenda/filtro-consulta-agenda.dto';
import { IConsultaSalvarDto } from '../dto/Agenda/consulta-salvar.dto';
import { IAtualizaObsDentistaDto } from '../dto/Agenda/atualiza-obs-dentista.dto';
import { IConsultaAtualizaStatusDto } from '../dto/Agenda/consulta-atualiza-status.dto';

@Injectable({
  providedIn: 'root',
})

export class ConsultaService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}api/consulta`;

  listar(): Observable<IConsulta[]> {
    return this.http.get<IConsulta[]>(this.apiUrl);
  }

  listarPorId(id: string | number): Observable<IConsulta> {
    return this.http.get<IConsulta>(this.apiUrl + '/' + id);
  }

  // GET /paciente → por id
  buscarPorPacienteId(idPaciente: number): Observable<IConsulta[]> {
    return this.http.get<IConsulta[]>(`${this.apiUrl}?pacienteId=${idPaciente}`);
  }

  buscarPorDentista(nome: string, especialidade: string): Observable<IConsultarConsultaPorDentista[]> {
    return this.http.get<IConsultarConsultaPorDentista[]>(`${this.apiUrl}/obter-por-dentista?nome=${nome}&especialidade=${especialidade}`);
  }

  buscarAgendaDentista(dentistaId: string, dataConsulta: Date): Observable<IConsulta[]> {
    let params = new HttpParams()
      .set('dataConsulta', dataConsulta.toISOString().split('T')[0])

    if (dentistaId)
      params = params.set('dentistaId', dentistaId);

    return this.http.get<IConsulta[]>(`${this.apiUrl}/obter-agenda-dentista`, { params });
  }

  buscarAgendaAbertaDentista(dentistaId: string | number, dataCorte: Date): Observable<Date[]> {
    let params = new HttpParams()
      .set('dataCorte', dataCorte.toISOString().split('T')[0])

    if (dentistaId)
      params = params.set('dentistaId', dentistaId);

    return this.http.get<Date[]>(`${this.apiUrl}/obter-datas-agenda-aberta-dentista`, { params });
  }

  buscarPorFiltroAgenda(filtro: IFiltroConsultarAgendaDto): Observable<IConsultaAgendaDto[]> {
    let params = new HttpParams()
      .set('dataInicial', filtro.dataInicial.toISOString().split('T')[0])
      .set('dataFinal', filtro.dataFinal.toISOString().split('T')[0])

    if (filtro.nomePaciente)
      params = params.set('nomePaciente', filtro.nomePaciente);

    if (filtro.cpf)
      params = params.set('cpf', filtro.cpf);

    if (filtro.dentistaId)
      params = params.set('dentistaId', filtro.dentistaId);

    return this.http.get<IConsultaAgendaDto[]>(`${this.apiUrl}/obter-agenda-filtro`, { params });
  }

  criarConsulta(dto: IConsultaSalvarDto): Observable<IConsulta> {
    return this.http.post<IConsulta>(this.apiUrl, dto);
  }

  atualizarObsDentista(consultaId: number | string, dto: IAtualizaObsDentistaDto): Observable<void> {
    return this.http.put<void>(this.apiUrl + '/obs-dentista/' + consultaId, dto);
  }

  atualizarStatus(consultaId: number | string, dto: IConsultaAtualizaStatusDto): Observable<void> {
    return this.http.put<void>(this.apiUrl + '/atualiza-status/' + consultaId, dto);
  }
}
