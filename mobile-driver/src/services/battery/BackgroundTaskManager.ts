import BackgroundFetch from 'react-native-background-fetch';
import { batteryOptimizer } from './BatteryOptimizer';

interface Task {
  id: string;
  handler: () => Promise<void>;
  interval: number;
  priority: 'high' | 'normal' | 'low';
  requiresNetwork: boolean;
  lastRun?: number;
}

class BackgroundTaskManager {
  private tasks: Map<string, Task> = new Map();
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      // Configurer BackgroundFetch
      await BackgroundFetch.configure(
        {
          minimumFetchInterval: 15, // 15 minutes minimum
          stopOnTerminate: false,
          enableHeadless: true,
          startOnBoot: true,
        },
        async (taskId) => {
          await this.executeTask(taskId);
          BackgroundFetch.finish(taskId);
        },
        (error) => {
          console.error('Background fetch failed to start:', error);
        }
      );

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing background task manager:', error);
    }
  }

  private async executeTask(taskId: string) {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Vérifier si la tâche peut s'exécuter selon l'état de la batterie
    if (!batteryOptimizer.shouldExecuteBackgroundTask()) {
      if (task.priority !== 'high') {
        console.log(`Skipping task ${taskId} due to battery optimization`);
        return;
      }
    }

    try {
      await task.handler();
      task.lastRun = Date.now();
    } catch (error) {
      console.error(`Error executing background task ${taskId}:`, error);
    }
  }

  // API Publique

  public async registerTask(task: Omit<Task, 'lastRun'>): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('BackgroundTaskManager not initialized');
    }

    // Vérifier si la tâche existe déjà
    if (this.tasks.has(task.id)) {
      throw new Error(`Task with id ${task.id} already exists`);
    }

    // Enregistrer la tâche
    this.tasks.set(task.id, { ...task, lastRun: undefined });

    // Configurer la tâche avec BackgroundFetch
    try {
      await BackgroundFetch.scheduleTask({
        taskId: task.id,
        delay: 0,
        periodic: true,
        forceAlarmManager: true,
        stopOnTerminate: false,
        enableHeadless: true,
        requiredNetworkType: task.requiresNetwork ? BackgroundFetch.NETWORK_TYPE_ANY : BackgroundFetch.NETWORK_TYPE_NONE,
      });
    } catch (error) {
      console.error(`Error scheduling task ${task.id}:`, error);
      this.tasks.delete(task.id);
      throw error;
    }
  }

  public async unregisterTask(taskId: string): Promise<void> {
    if (!this.tasks.has(taskId)) {
      return;
    }

    try {
      await BackgroundFetch.stopTask(taskId);
      this.tasks.delete(taskId);
    } catch (error) {
      console.error(`Error unregistering task ${taskId}:`, error);
      throw error;
    }
  }

  public async getRegisteredTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  public async getTaskStatus(taskId: string): Promise<{
    isRegistered: boolean;
    lastRun?: number;
    nextRun?: number;
  }> {
    const task = this.tasks.get(taskId);
    if (!task) {
      return { isRegistered: false };
    }

    return {
      isRegistered: true,
      lastRun: task.lastRun,
      nextRun: task.lastRun ? task.lastRun + task.interval : undefined,
    };
  }

  public async optimizeTaskSchedule(): Promise<void> {
    const batteryInfo = batteryOptimizer.getCurrentBatteryInfo();
    const tasks = Array.from(this.tasks.values());

    for (const task of tasks) {
      if (batteryInfo.lowPowerMode && task.priority === 'low') {
        await this.unregisterTask(task.id);
      } else if (batteryInfo.level <= 0.15 && task.priority !== 'high') {
        await this.unregisterTask(task.id);
      }
    }
  }
}

export const backgroundTaskManager = new BackgroundTaskManager();
