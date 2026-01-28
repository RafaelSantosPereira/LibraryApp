import { Component, EventEmitter, output, Output, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';


@Component({
  selector: 'app-header',
  imports: [
    MatToolbarModule, 
    MatIconModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatInputModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  menuToggled = output<void>();
  themeToggled = output<boolean>();
  isDarkMode = signal(false);

  onMenuClick() {
    this.menuToggled.emit(); 
  }
  toggleTheme() {
    // Inverte o valor (true -> false, false -> true)
    this.isDarkMode.update(value => !value);
    this.themeToggled.emit(this.isDarkMode());
  }
}
