import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { PacienteLista } from './component/paciente/paciente-lista/paciente-lista';
import { Layout } from './layout/layout';
import { PacienteForm } from './component/paciente/paciente-form/paciente-form';
import { DentistaLista } from './component/dentista/dentista-lista/dentista-lista';
import { DentistaForm } from './component/dentista/dentista-form/dentista-form';
import { ConvenioLista } from './component/convenio/convenio-lista/convenio-lista';
import { ConvenioForm } from './component/convenio/convenio-form/convenio-form';
import { ConsultaAgenda } from './component/consulta/consulta-agenda/consulta-agenda';
import { CriarConsulta } from './component/consulta/criar-consulta/criar-consulta';
import { DetalheConsulta } from './component/consulta/detalhe-consulta/detalhe-consulta';
import { UsuarioLista } from './component/usuario/usuario-lista/usuario-lista';
import { LoginComponent } from './component/login/login/login';
import { authGuard } from './guards/auth.guard';
import { perfilGuard } from './guards/perfil.guard';

export const routes: Routes = [

  { path: 'login', component: LoginComponent },   // pública

  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'agenda', pathMatch: 'full' },   // raiz → agenda

      // AGENDA
      { path: 'agenda', component: ConsultaAgenda },
      { path: 'agenda-criar', component: CriarConsulta },
      { path: 'agenda/:id/detalhe', component: DetalheConsulta },

      // PACIENTE
      { path: 'pacientes', component: PacienteLista,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica', 'Recepcionista'] } },
      { path: 'pacientes/novo', component: PacienteForm,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica', 'Recepcionista'] } },
      { path: 'pacientes/:id/editar', component: PacienteForm,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica', 'Recepcionista'] } },

      // DENTISTA
      { path: 'dentistas', component: DentistaLista,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica', 'Recepcionista'] } },
      { path: 'dentista/novo', component: DentistaForm,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica'] } },
      { path: 'dentista/:id/editar', component: DentistaForm,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica', 'Recepcionista'] } },

      // CONVÊNIO
      { path: 'convenios', component: ConvenioLista,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica', 'Recepcionista'] } },
      { path: 'convenio/novo', component: ConvenioForm,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica'] } },
      { path: 'convenio/:id/editar', component: ConvenioForm,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica'] } },



      { path: 'usuarios', component: UsuarioLista,
        canActivate: [perfilGuard],
        data: { perfis: ['Administrador', 'Administração Clínica'] } },
    ]
  },

  // '**' = qualquer URL que não bateu com nenhuma rota acima. Precisa ser a ÚLTIMA.
  { path: '**', redirectTo: '' }

];
