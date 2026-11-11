import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { IUsuario } from "../models/usuario.models";
import { IUsuarioSalvar } from "../dto/usuario/usuario-salvar.dto";

@Injectable({
  providedIn: 'root',
})

export class UsuarioService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl + 'api/usuario';

  listar(): Observable<IUsuario[]> {
      return this.http.get<IUsuario[]>(this.apiUrl);
    }

  listarPorId(id: string | number): Observable<IUsuario> {
    return this.http.get<IUsuario>(this.apiUrl + '/' + id);
  }

  criar(dto: IUsuarioSalvar): Observable<void> {
    return this.http.post<void>(this.apiUrl, dto);
  }

  atualizar(id: string | number, dto: IUsuarioSalvar): Observable<void> {
    return this.http.put<void>(this.apiUrl + '/' + id, dto);
  }
}
