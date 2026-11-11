import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IBuscaCep } from '../models/busca-cep.models'
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuscaCepService {

  private readonly URI = 'https://viacep.com.br/ws/';
  private readonly http = inject(HttpClient);

  buscar(cep: string): Observable<IBuscaCep>{
    return this.http.get<IBuscaCep>(`${this.URI}${cep}/json`);
  }
}
