// task-list.component.ts
import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../../services/task.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  users: any[] = [];

  // Search property
  searchQuery: string = '';
  private searchTimeout: any;

  // Filter properties
  filters = {
    status: '',
    priority: '',
    assignee: ''
  };

  // Comment-related properties
  showComments: { [taskId: string]: boolean } = {};
  taskComments: { [taskId: string]: any[] } = {};
  newComment: { [taskId: string]: string } = {};
  loadingComments: { [taskId: string]: boolean } = {};

  // Options for dropdowns
  statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'In-progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' }
  ];

  priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'Low', label: 'Low' },
    { value: 'Medium', label: 'Medium' },
    { value: 'High', label: 'High' }
  ];

  constructor(private taskService: TaskService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.loadUsers();
    this.getAllTasks();
  }

  loadUsers(): void {
    this.taskService.getUsers().subscribe({
      next: (res) => {
        this.users = res.data || [];
      },
      error: () => {
        this.toastr.error('Failed to load users');
      }
    });
  }

  getAllTasks() {
    // Build request body from filters and search
    const requestBody: any = {
      status: this.filters.status || '',
      priority: this.filters.priority || '',
      assignee: this.filters.assignee || '',
      search: this.searchQuery || ''
    };

    // Remove empty filter values to avoid sending empty strings
    Object.keys(requestBody).forEach(key => {
      if (!requestBody[key]) {
        delete requestBody[key];
      }
    });

    this.taskService.getAllTasks(requestBody).subscribe({
      next: (res: any) => {
        this.tasks = res.data || [];
      },
      error: () => {
        this.toastr.error('Failed to load tasks');
      }
    });
  }

  // Search functionality with debounce
  onSearchChange() {
    // Clear existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Set new timeout for debounced search
    this.searchTimeout = setTimeout(() => {
      this.getAllTasks();
    }, 500); // 500ms delay
  }

  // Method called when filter values change
  applyFilters() {
    this.getAllTasks();
  }

  // Method to clear all filters and search
  clearFilters() {
    this.searchQuery = '';
    this.filters = {
      status: '',
      priority: '',
      assignee: ''
    };
    this.getAllTasks();
  }

  // Comment functionality
  toggleComments(taskId: string) {
    this.showComments[taskId] = !this.showComments[taskId];
    
    if (this.showComments[taskId] && !this.taskComments[taskId]) {
      this.loadComments(taskId);
    }
  }

  loadComments(taskId: string) {
    this.loadingComments[taskId] = true;
    
    this.taskService.getCommentsByTask(taskId).subscribe({
      next: (res: any) => {
        this.taskComments[taskId] = res.data || [];
        this.loadingComments[taskId] = false;
      },
      error: () => {
        this.toastr.error('Failed to load comments');
        this.loadingComments[taskId] = false;
        this.taskComments[taskId] = [];
      }
    });
  }

  addComment(taskId: string) {
    const comment = this.newComment[taskId]?.trim();
    
    if (!comment) {
      this.toastr.warning('Please enter a comment');
      return;
    }

    this.taskService.addComment(taskId, comment).subscribe({
      next: (res: any) => {
        this.toastr.success('Comment added successfully');
        this.newComment[taskId] = ''; 
        this.loadComments(taskId);
      },
      error: () => {
        this.toastr.error('Failed to add comment');
      }
    });
  }

  getCommentCount(taskId: string): number {
    return this.taskComments[taskId]?.length || 0;
  }

  deleteTask(id: string) {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.toastr.success('Task deleted successfully');
          // Also clean up comment data for this task
          delete this.showComments[id];
          delete this.taskComments[id];
          delete this.newComment[id];
          delete this.loadingComments[id];
          this.getAllTasks();
        },
        error: () => {
          this.toastr.error('Failed to delete task');
        }
      });
    }
  }
}