import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, catchError, of, forkJoin } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

// Interface for notification type
interface NotificationType {
  value: string;
  label: string;
}

// Interface for Notification (adjust based on your API response)
interface Notification {
  _id: string;
  id: string;
  type: string;
  title?: string;
  message: string;
  is_read: boolean;
  createdAt: string;
  priority?: string;
  taskTitle?: string;
  projectTitle?: string;
  userName?: string;
  actionUrl?: string;
  actionText?: string;
  taskId?: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  // Component state
  notifications: Notification[] = [];
  loading = false;
  showQuickActions = false;
  showConfirmModal = false;

  // Counts
  unreadCount = 0;
  totalCount = 0;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  get paginatedNotifications(): Notification[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.sortedNotifications.slice(startIndex, endIndex);
  }

  get sortedNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Modal properties
  confirmModalTitle = '';
  confirmModalMessage = '';
  confirmModalAction = '';
  private pendingAction: (() => void) | null = null;

  // Destroy subject for cleanup
  private readonly destroy$ = new Subject<void>();

  // Math object for template
  Math = Math;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // API Methods - Only using the three available endpoints
  loadNotifications(): void {
    this.loading = true;

    this.notificationService.getNotificationsByUser()
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error loading notifications:', error);
          this.loading = false;
          return of([]);
        })
      )
      .subscribe(notifications => {
        this.loading = false;
        this.notifications = notifications.data || [];
        this.updateCounts();
        this.updatePagination();
      });
  }

  markAsRead(notification: any): void {
    const notificationId = notification._id || notification.id;
    this.notificationService.markAsRead(notificationId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error marking as read:', error);
          return of(null);
        })
      )
      .subscribe((result: any) => {
        this.loadNotifications();
        this.updateCounts();
      });
  }

  markAsUnread(notificationId: string): void {
    // Since there's no API endpoint for marking as unread, only update locally
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.is_read = false;
      this.updateCounts();
    }
  }

  deleteNotification(notification: any): void {
    const notificationId = notification._id || notification.id;
    this.notificationService.deleteNotification(notificationId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('Error deleting notification:', error);
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.loadNotifications();
          this.updateCounts();
          this.updatePagination();
        }
      });
  }

  // Bulk Actions
  markAllAsRead(): void {
    this.confirmModalTitle = 'Mark All as Read';
    this.confirmModalMessage = `Are you sure you want to mark all ${this.unreadCount} unread notifications as read?`;
    this.confirmModalAction = 'Mark All Read';
    this.pendingAction = () => {
      const unreadNotifications = this.notifications.filter(n => !n.is_read);

      if (unreadNotifications.length === 0) {
        return;
      }

      // Use forkJoin to handle multiple API calls
      const markAsReadRequests = unreadNotifications.map(notification =>
        this.notificationService.markAsRead(notification.id).pipe(
          catchError(error => {
            console.error(`Error marking notification ${notification.id} as read:`, error);
            return of(null);
          })
        )
      );

      forkJoin(markAsReadRequests).subscribe(results => {
        // Update local state for successful requests
        results.forEach((result, index) => {
          if (result) {
            unreadNotifications[index].is_read = true;
          }
        });
        this.updateCounts();
      });
    };
    this.showConfirmModal = true;
  }

  clearAllNotifications(): void {
    this.confirmModalTitle = 'Clear All Notifications';
    this.confirmModalMessage = `Are you sure you want to delete all ${this.totalCount} notifications? This action cannot be undone.`;
    this.confirmModalAction = 'Clear All';
    this.pendingAction = () => {
      if (this.notifications.length === 0) {
        return;
      }

      // Use forkJoin to handle multiple delete requests
      const deleteRequests = this.notifications.map(notification =>
        this.notificationService.deleteNotification(notification.id).pipe(
          catchError(error => {
            console.error(`Error deleting notification ${notification.id}:`, error);
            return of(null);
          })
        )
      );

      forkJoin(deleteRequests).subscribe(results => {
        // Remove successfully deleted notifications
        const successfulDeletions = results.filter(result => result !== null);

        // If all were successful, clear all; otherwise filter based on results
        if (successfulDeletions.length === this.notifications.length) {
          this.notifications = [];
        } else {
          // More complex filtering needed if some failed - for simplicity, reload
          this.loadNotifications();
          return;
        }

        this.updateCounts();
        this.updatePagination();
      });
    };
    this.showConfirmModal = true;
  }

  // Pagination Methods
  private updatePagination(): void {
    this.totalPages = Math.ceil(this.notifications.length / this.pageSize);
    if (this.totalPages === 0) this.totalPages = 1;
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    if (this.currentPage < 1) this.currentPage = 1;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getVisiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = Math.max(1, this.currentPage - half);
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  // Utility Methods
  private updateCounts(): void {
    this.totalCount = this.notifications.length;
    this.unreadCount = this.notifications.filter(n => !n.is_read).length;
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  getNotificationIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'task_assigned': 'fa fa-tasks',
      'task_completed': 'fa fa-check-circle',
      'task_overdue': 'fa fa-exclamation-triangle',
      'project_update': 'fa fa-folder',
      'deadline_reminder': 'fa fa-clock-o',
      'comment_added': 'fa fa-comment',
      'status_changed': 'fa fa-refresh',
      'system': 'fa fa-cog'
    };
    return iconMap[type] || 'fa fa-bell';
  }

  // getNotificationTypeLabel(type: string): string {
  //   const typeObj = this.notificationTypes.find(t => t.value === type);
  //   return typeObj ? typeObj.label : type;
  // }

  getDefaultTitle(type: string): string {
    const titleMap: { [key: string]: string } = {
      'task_assigned': 'New Task Assigned',
      'task_completed': 'Task Completed',
      'task_overdue': 'Task Overdue',
      'project_update': 'Project Updated',
      'deadline_reminder': 'Deadline Reminder',
      'comment_added': 'New Comment',
      'status_changed': 'Status Changed',
      'system': 'System Notification'
    };
    return titleMap[type] || 'Notification';
  }

  // Navigation Methods
  navigateToAction(notification: Notification): void {
    if (notification.actionUrl) {
      // Mark as read first
      if (!notification.is_read) {
        this.markAsRead(notification.id);
      }
      // Navigate to the action URL
      this.router.navigateByUrl(notification.actionUrl);
    }
  }

  navigateToTask(taskId: string): void {
    // Navigate to task details page
    this.router.navigate(['/tasks', taskId]);
  }

  // Quick Actions
  toggleQuickActions(): void {
    this.showQuickActions = !this.showQuickActions;
  }

  refreshNotifications(): void {
    this.showQuickActions = false;
    this.loadNotifications();
  }

  exportNotifications(): void {
    this.showQuickActions = false;
    const dataStr = JSON.stringify(this.notifications, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `notifications_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Modal Methods
  confirmAction(): void {
    if (this.pendingAction) {
      this.pendingAction();
      this.pendingAction = null;
    }
    this.closeConfirmModal();
  }

  closeConfirmModal(): void {
    this.showConfirmModal = false;
    this.pendingAction = null;
  }
}