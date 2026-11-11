import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IConfiguracaoSistema } from '../models/configuracao-sistema.models';

@Injectable({
  providedIn: 'root',
})
export class ConsiguracaoSistemaService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = `${environment.apiUrl}api/ConfiguracaoSistema`;

  obterTodos(): Observable<IConfiguracaoSistema[]>{
    return this.http.get<IConfiguracaoSistema[]>(this.apiUrl);
  }

  obterPorId(id: number): Observable<IConfiguracaoSistema>{
    return this.http.get<IConfiguracaoSistema>(`${this.apiUrl}/${id}`);
  }

  intervaloMinimoMinConsultas(): Observable<IConfiguracaoSistema>{
    return this.obterPorId(1);
  }
}
