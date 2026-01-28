import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';


@Component({
  selector: 'app-root',
  standalone: true,
  // Aqui importamos os NOSSOS componentes novos
  imports: [RouterOutlet, MatSidenavModule, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'BiblioTech';

  // Precisamos do Renderer2 para mexer na tag <body> de forma segura
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {}

  onThemeChanged(isDark: boolean) {
    const hostClass = 'dark-theme';
    
    if (isDark) {
      // Adiciona a classe 'dark-theme' ao body
      this.renderer.addClass(this.document.body, hostClass);
    } else {
      // Remove a classe
      this.renderer.removeClass(this.document.body, hostClass);
    }
  }
}