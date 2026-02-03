import { Component, Inject, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, MatSidenavModule, HeaderComponent, SidebarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
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
      localStorage.setItem('theme', 'dark');
    } else {
      // Remove a classe
      this.renderer.removeClass(this.document.body, hostClass);
      localStorage.setItem('theme', 'light');
    }
  }
}
