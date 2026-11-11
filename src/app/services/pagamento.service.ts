import { IPagamento } from './../models/pagamento.models';
import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: 'root',
})

export class PagamentoService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/pagamento';

  listar(): Observable<IPagamento[]> {
      return this.http.get<IPagamento[]>(this.apiUrl);
  }

  listarPorId(id: string | number): Observable<IPagamento> {
      return this.http.get<IPagamento>(this.apiUrl + '/' + id);
  }
}
