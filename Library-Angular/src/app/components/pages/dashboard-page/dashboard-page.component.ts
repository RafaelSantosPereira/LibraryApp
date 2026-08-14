import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

import { UserDashboardComponent } from '../user-dashboard/user-dashboard.component';
import { AdminDashboardComponent } from '../admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, UserDashboardComponent, AdminDashboardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  private authService = inject(AuthService);

  // Create a computed signal to immediately know whether the user is an admin
  isAdmin = computed(() => this.authService.isAdmin());
}