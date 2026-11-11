import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { IAutenticado } from '../../../dto/Auth/autenticado.dto';
import { IAuth } from '../../../dto/Auth/auth.dto';
import { uExtrairErro } from '../../../util/erro.util';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/auth/token.service';
import { SessionService } from '../../../services/auth/session.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})

export class LoginComponent {

  private readonly authService = inject(AuthService);
  private readonly tokenService = inject(TokenService);
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  //protected readonly login = signal('');
  //protected readonly senha = signal('');
  protected readonly verSenha = signal(false);          // controla o olho
  protected readonly erro = signal<string | null>(null);
  protected readonly carregando = signal(false);

  protected readonly autenticado = signal<IAutenticado | null>(null);

  readonly form = this.formBuilder.nonNullable.group({
    login: ['', [Validators.required]], // nonNullable evita de login e senha serem nulos
    senha: ['', [Validators.required]],
    //senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  entrar() {

    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    this.carregando.set(true);

    const {login, senha} = this.form.getRawValue();

    const authDto: IAuth = {
      login: login.trim(),
      senha: senha
    };

    this.authService.login(authDto)
      .subscribe({
        next: (result) => {
          this.autenticado.set(result);

          //this.tokenService.salvar(result.token); // SALVA SOMENTE O TOKEN

          this.sessionService.iniciarSessao({
            token: result.token,
            usuarioNome: result.nome,
            perfilNome: result.perfil,
            usuarioId: Number(result.id)
          });

          this.router.navigate(['/agenda'])
        },
        error: (er) => {
          this.erro.set(uExtrairErro(er));
          this.carregando.set(false);
        }
      });
  }
}
