import { Component, Inject, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DOCUMENT } from '@angular/common';



@Component({
  selector: 'app-root',
  standalone: true,
  // Aqui importamos os NOSSOS componentes novos
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'BiblioTech';

  theam = localStorage.getItem('theme');
  
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2
  ) {}

  ngOnInit() {
    const currentTheme = localStorage.getItem('theme');
    if(!currentTheme){
      localStorage.setItem('theme', 'light');
    }
    if (currentTheme === 'dark') {
      this.renderer.addClass(this.document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
    }
  }


}