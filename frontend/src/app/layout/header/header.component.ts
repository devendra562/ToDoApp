// header.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Notification {
  id: string;
  type: 'task' | 'comment' | 'mention' | 'deadline' | 'system';
  message: string;
  is_read: boolean;
  createdAt: Date;
  taskId?: string;
  userId?: string;
}

interface SearchResult {
  id: string;
  title: string;
  type: 'task' | 'project' | 'user';
  icon: string;
  url: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private quickSearchSubject = new Subject<string>();

  // User data
  currentUser: User | null = null;

  // UI State
  showSearch = false;
  showNotifications = false;
  showProfile = false;
  showMobileMenu = false;

  // Search
  quickSearchQuery = '';
  searchResults: SearchResult[] = [];

  // Notifications
  notifications: Notification[] = [];
  unreadNotifications = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    // Setup search debouncing
    this.quickSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadNotifications();
    this.setupNotificationPolling();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.quick-search')) {
      this.showSearch = false;
    }

    if (!target.closest('.notifications-container')) {
      this.showNotifications = false;
    }

    if (!target.closest('.user-profile')) {
      this.showProfile = false;
    }
  }

  // Close mobile menu on escape key
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMobileMenu();
    this.showSearch = false;
    this.showNotifications = false;
    this.showProfile = false;
  }

  // User Management
  private loadCurrentUser(): void {
    // Mock user data - replace with actual service call
    // this.currentUser = {
    //   _id: '1',
    //   name: 'John Doe',
    //   email: 'john.doe@example.com'
    // };
    this.authService.fetchCurrentUser().subscribe({
      next: (user) => {
        this.currentUser = user.data;
      },
      error: (err) => {
        console.error('Failed to fetch current user', err);
      }
    })
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.closeMobileMenu();
  }

  // Search Functionality
  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    this.showNotifications = false;
    this.showProfile = false;

    if (this.showSearch) {
      setTimeout(() => {
        const searchInput = document.querySelector('.search-input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }

  onQuickSearch(): void {
    this.quickSearchSubject.next(this.quickSearchQuery);
  }

  private performSearch(query: string): void {
    if (!query || query.length < 2) {
      this.searchResults = [];
      return;
    }

    // Mock search results - replace with actual service call
    this.searchResults = [
      {
        id: '1',
        title: `Task containing "${query}"`,
        type: 'task',
        icon: 'fa fa-tasks',
        url: '/tasks/1'
      },
      {
        id: '2',
        title: `Project containing "${query}"`,
        type: 'project',
        icon: 'fa fa-folder',
        url: '/projects/2'
      }
    ];

    // Actual implementation would be:
    // this.searchService.quickSearch(query)
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(results => {
    //     this.searchResults = results;
    //   });
  }

  navigateToResult(result: SearchResult): void {
    this.router.navigate([result.url]);
    this.showSearch = false;
    this.quickSearchQuery = '';
    this.searchResults = [];
  }

  // Notification Management
  private loadNotifications(): void {

    this.notificationService.getNotificationsByUser()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications.data || [];
        this.updateNotificationCount();
      });
    this.updateNotificationCount();
  }

  private setupNotificationPolling(): void {
    // Poll for new notifications every 30 seconds
    // setInterval(() => {
    //   this.loadNotifications();
    // }, 30000);
  }

  private updateNotificationCount(): void {
    this.unreadNotifications = this.notifications.filter(n => !n.is_read).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showSearch = false;
    this.showProfile = false;
  }

  markAsRead(notification: any): void {
    const notificationId = notification._id;


    // Actual implementation would be:
    this.notificationService.markAsRead(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
          this.updateNotificationCount();
        },
        error: (err) => {
          console.error('Error marking notification as read', err);
        }
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.updateNotificationCount();
          this.loadNotifications();
        },
        error: (err) => console.error('Error', err)
      });

  }

  deleteNotification(notification: any): void {
    const notificationId = notification._id;
    this.notificationService.deleteNotification(notificationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadNotifications();
          this.updateNotificationCount();
        },
        error: (err) => {
          console.error('Error deleting notification', err);
        }
      });
  }

  getNotificationIcon(type: string): string {
    const icons = {
      task: 'fa fa-tasks',
      comment: 'fa fa-comment',
      mention: 'fa fa-at',
      deadline: 'fa fa-clock-o',
      system: 'fa fa-info-circle'
    };
    // return icons[type] || 'fa fa-bell';
    return 'fa fa-bell';

  }

  // Profile Management
  toggleProfile(): void {
    this.showProfile = !this.showProfile;
    this.showSearch = false;
    this.showNotifications = false;
  }

  // Mobile Menu Management
  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;

    // Prevent body scroll when mobile menu is open
    if (this.showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
    document.body.style.overflow = '';
  }

  // Utility method for notification polling
  private addNewNotification(notification: Notification): void {
    this.notifications.unshift(notification);
    this.updateNotificationCount();

    // Optional: Show toast notification for new notifications
    // this.toastService.show(`New ${notification.type}: ${notification.message}`);
  }
}