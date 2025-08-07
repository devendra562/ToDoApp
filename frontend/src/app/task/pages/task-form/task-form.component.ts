import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../../services/task.service';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent {
  id: string | null = null;
  users: any[] = [];
  private socketSubscription!: Subscription;  

  constructor(private route: ActivatedRoute, private taskService: TaskService, private router: Router, private toastr: ToastrService, private socketService: SocketService) { }

  taskForm = new FormGroup({
    title: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    assignee: new FormControl('', Validators.required),
    dueDate: new FormControl('', Validators.required),
    priority: new FormControl('Medium', Validators.required),
    status: new FormControl('Pending', Validators.required)
  })

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadUsers();
    if (this.id) {
      this.getTask(this.id);
    }
  }

  getTask(id: string): void {
    this.taskService.getSingleTask(id).subscribe({
      next: (res: any) => {
        const task = res.data;
        this.taskForm.patchValue({
          title: task.title || '',
          description: task.description || '',
          assignee: task.assignee._id || '',
          dueDate: task.dueDate?.substring(0, 10) || '',
          priority: task.priority || 'Medium',
          status: task.status || 'Pending'
        })
      },
      error: () => {
        this.toastr.error('Failed to load task');
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) return;

    const { title, description, assignee, dueDate } = this.taskForm.value;

    const taskData = { title, description, assignee, dueDate };

    if (this.id) {
      this.taskService.updateTask(this.id, taskData).subscribe({
        next: () => {
          this.toastr.success('Task updated successfully');
          this.router.navigate(['/tasks']);
        },
        error: (err) => {
          this.toastr.error('Failed to update task');
        }
      });
    } else {
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.toastr.success('Task created successfully');
          this.router.navigate(['/tasks']);
        },
        error: () => {
          this.toastr.error('Failed to create task');
        }
      });
    }
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

}
