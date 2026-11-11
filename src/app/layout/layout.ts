import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Menu } from './menu/menu';

@Component({
  selector: 'app-layout',
  imports: [Menu, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
