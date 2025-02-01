import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { DriverTask, TaskStatus, TaskType, TaskPriority } from '../entities/driver-task.entity';
import { Driver } from '../entities/driver.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { addDays, isAfter } from 'date-fns';

@Injectable()
export class DriverTaskService {
  constructor(
    @InjectRepository(DriverTask)
    private taskRepo: Repository<DriverTask>,
    @InjectRepository(Driver)
    private driverRepo: Repository<Driver>,
    private notificationsService: NotificationsService,
  ) {}

  async createTask(data: Partial<DriverTask>): Promise<DriverTask> {
    const task = this.taskRepo.create(data);
    
    // Vérifier les dépendances
    if (task.dependencies?.length) {
      await this.validateDependencies(task.dependencies);
    }

    // Créer la tâche
    const savedTask = await this.taskRepo.save(task);

    // Créer les tâches récurrentes si nécessaire
    if (task.recurrence) {
      await this.createRecurringTasks(savedTask);
    }

    // Envoyer les notifications
    await this.sendTaskNotifications(savedTask, 'CREATED');

    return savedTask;
  }

  async updateTaskStatus(
    taskId: string,
    status: TaskStatus,
    completionData?: any,
  ): Promise<DriverTask> {
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ['driver'],
    });

    if (!task) {
      throw new Error('Tâche non trouvée');
    }

    // Vérifier si la tâche peut être mise à jour
    await this.validateStatusUpdate(task, status);

    // Mettre à jour le statut
    task.status = status;
    
    if (status === TaskStatus.COMPLETED) {
      task.completedDate = new Date();
      task.completion = completionData;
    }

    const updatedTask = await this.taskRepo.save(task);

    // Mettre à jour les tâches dépendantes
    await this.updateDependentTasks(taskId);

    // Envoyer les notifications
    await this.sendTaskNotifications(updatedTask, 'UPDATED');

    return updatedTask;
  }

  async getDriverTasks(
    driverId: string,
    filters?: {
      status?: TaskStatus[];
      type?: TaskType[];
      priority?: TaskPriority[];
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<DriverTask[]> {
    const query = this.taskRepo
      .createQueryBuilder('task')
      .where('task.driver.id = :driverId', { driverId });

    if (filters?.status) {
      query.andWhere('task.status IN (:...status)', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('task.type IN (:...type)', { type: filters.type });
    }

    if (filters?.priority) {
      query.andWhere('task.priority IN (:...priority)', {
        priority: filters.priority,
      });
    }

    if (filters?.startDate) {
      query.andWhere('task.dueDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('task.dueDate <= :endDate', { endDate: filters.endDate });
    }

    return query
      .orderBy('task.priority', 'DESC')
      .addOrderBy('task.dueDate', 'ASC')
      .getMany();
  }

  async getBlockingTasks(driverId: string): Promise<DriverTask[]> {
    return this.taskRepo.find({
      where: {
        driver: { id: driverId },
        isBlocking: true,
        status: TaskStatus.PENDING,
      },
    });
  }

  private async validateDependencies(dependencies: string[]): Promise<void> {
    for (const depId of dependencies) {
      const depTask = await this.taskRepo.findOne({
        where: { id: depId },
      });

      if (!depTask) {
        throw new Error(`Tâche dépendante ${depId} non trouvée`);
      }
    }
  }

  private async validateStatusUpdate(
    task: DriverTask,
    newStatus: TaskStatus,
  ): Promise<void> {
    // Vérifier les dépendances
    if (newStatus === TaskStatus.COMPLETED && task.dependencies?.length) {
      const incompleteDeps = await this.taskRepo.count({
        where: {
          id: task.dependencies,
          status: TaskStatus.COMPLETED,
        },
      });

      if (incompleteDeps < task.dependencies.length) {
        throw new Error('Toutes les tâches dépendantes doivent être terminées');
      }
    }

    // Vérifier la validation si nécessaire
    if (
      newStatus === TaskStatus.COMPLETED &&
      task.requiresValidation &&
      !task.completion?.completedBy
    ) {
      throw new Error('La tâche nécessite une validation');
    }
  }

  private async updateDependentTasks(taskId: string): Promise<void> {
    const dependentTasks = await this.taskRepo.find({
      where: {
        dependencies: taskId,
      },
    });

    for (const depTask of dependentTasks) {
      // Vérifier si toutes les dépendances sont complétées
      const allDepsCompleted = await this.areAllDependenciesCompleted(depTask);
      
      if (allDepsCompleted) {
        depTask.status = TaskStatus.PENDING;
        await this.taskRepo.save(depTask);
        await this.sendTaskNotifications(depTask, 'UNBLOCKED');
      }
    }
  }

  private async areAllDependenciesCompleted(task: DriverTask): Promise<boolean> {
    if (!task.dependencies?.length) return true;

    const completedDeps = await this.taskRepo.count({
      where: {
        id: task.dependencies,
        status: TaskStatus.COMPLETED,
      },
    });

    return completedDeps === task.dependencies.length;
  }

  private async createRecurringTasks(baseTask: DriverTask): Promise<void> {
    const { recurrence } = baseTask;
    if (!recurrence) return;

    let currentDate = addDays(baseTask.dueDate, 1);
    let count = 0;

    while (
      (!recurrence.endDate || isAfter(recurrence.endDate, currentDate)) &&
      (!recurrence.count || count < recurrence.count)
    ) {
      // Calculer la prochaine date selon la fréquence
      switch (recurrence.frequency) {
        case 'DAILY':
          currentDate = addDays(currentDate, recurrence.interval);
          break;
        case 'WEEKLY':
          currentDate = addDays(currentDate, 7 * recurrence.interval);
          break;
        case 'MONTHLY':
          currentDate.setMonth(currentDate.getMonth() + recurrence.interval);
          break;
        case 'YEARLY':
          currentDate.setFullYear(currentDate.getFullYear() + recurrence.interval);
          break;
      }

      // Créer la nouvelle tâche
      const newTask = this.taskRepo.create({
        ...baseTask,
        dueDate: currentDate,
        parentTaskId: baseTask.id,
        status: TaskStatus.PENDING,
        completedDate: null,
        completion: null,
      });

      await this.taskRepo.save(newTask);
      count++;
    }
  }

  private async sendTaskNotifications(
    task: DriverTask,
    event: 'CREATED' | 'UPDATED' | 'UNBLOCKED',
  ): Promise<void> {
    const notifications = [];

    // Notification de base
    notifications.push({
      type: `TASK_${event}`,
      title: `Tâche ${
        event === 'CREATED'
          ? 'créée'
          : event === 'UPDATED'
          ? 'mise à jour'
          : 'débloquée'
      }`,
      message: `${task.title} - ${task.description}`,
      recipients: [task.driver.id],
      metadata: {
        taskId: task.id,
        type: task.type,
        priority: task.priority,
        dueDate: task.dueDate,
      },
    });

    // Notifications pour les validateurs si nécessaire
    if (task.requiresValidation && task.validators?.length) {
      notifications.push({
        type: 'TASK_NEEDS_VALIDATION',
        title: 'Validation requise',
        message: `La tâche ${task.title} nécessite votre validation`,
        recipients: task.validators,
        metadata: {
          taskId: task.id,
          type: task.type,
          priority: task.priority,
        },
      });
    }

    // Envoyer toutes les notifications
    await Promise.all(
      notifications.map((notif) => this.notificationsService.create(notif)),
    );
  }

  async checkOverdueTasks(): Promise<void> {
    const overdueTasks = await this.taskRepo.find({
      where: {
        status: TaskStatus.PENDING,
        dueDate: LessThan(new Date()),
      },
      relations: ['driver'],
    });

    for (const task of overdueTasks) {
      task.status = TaskStatus.OVERDUE;
      await this.taskRepo.save(task);

      await this.notificationsService.create({
        type: 'TASK_OVERDUE',
        title: 'Tâche en retard',
        message: `La tâche ${task.title} est en retard`,
        recipients: [task.driver.id, ...task.validators || []],
        metadata: {
          taskId: task.id,
          type: task.type,
          priority: task.priority,
          dueDate: task.dueDate,
        },
      });
    }
  }
}
