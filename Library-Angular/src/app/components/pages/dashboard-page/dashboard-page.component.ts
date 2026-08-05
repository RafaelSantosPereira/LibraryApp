import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

// Imagina que criaste estes dois componentes em ficheiros separados
import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, UserDashboardComponent, ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  private authService = inject(AuthService);

  // Criamos um signal computed para saber logo se é admin
  isAdmin = computed(() => this.authService.isAdmin());
}