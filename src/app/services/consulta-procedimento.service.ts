import { IProcedimento } from '../models/procedimento.models';
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IConsultaProcedimento } from '../models/consulta-procedimento.models';
import { IConsultaProcedimentoSalvarDto } from '../dto/Agenda/consulta-procedimento-salvar.dto';
import { IConsultaProcedimentoEditarDto } from '../dto/Agenda/consulta-procedimento-editar.dto';

@Injectable({
  providedIn: 'root',
})

export class ConsultaProcedimentoService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/ConsultaProcedimento';

  listarPorConsulta(consultaId: number | string): Observable<IConsultaProcedimento[]> {
    return this.http.get<IConsultaProcedimento[]>(this.apiUrl + '/listar-por-consulta/' + consultaId);
  }

  obterPorId(consultaProcedimentoId: number | string): Observable<IConsultaProcedimento> {
    return this.http.get<IConsultaProcedimento>(this.apiUrl + '/' + consultaProcedimentoId);
  }

  criar(obj: IConsultaProcedimentoSalvarDto): Observable<void> {
    return this.http.post<void>(this.apiUrl, obj);
  }

  alterar(consultaProcedimentoId: number | string, obj: IConsultaProcedimentoEditarDto): Observable<void> {
    return this.http.put<void>(this.apiUrl + '/' + consultaProcedimentoId, obj);
  }

  inativar(consultaProcedimentoId: number | string): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/' + consultaProcedimentoId);
  }
}
