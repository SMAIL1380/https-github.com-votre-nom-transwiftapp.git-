import { backgroundTaskManager } from '../../../services/battery/BackgroundTaskManager';
import BackgroundFetch from 'react-native-background-fetch';
import { batteryOptimizer } from '../../../services/battery/BatteryOptimizer';

jest.mock('react-native-background-fetch');
jest.mock('../../../services/battery/BatteryOptimizer');

describe('BackgroundTaskManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock la configuration de BackgroundFetch
    (BackgroundFetch.configure as jest.Mock).mockImplementation((config, callback) => {
      callback('test-task');
      return Promise.resolve();
    });
  });

  describe('Task Registration', () => {
    it('should register a task successfully', async () => {
      const taskHandler = jest.fn();
      await backgroundTaskManager.registerTask({
        id: 'test-task',
        handler: taskHandler,
        interval: 15 * 60 * 1000,
        priority: 'normal',
        requiresNetwork: true,
      });

      expect(BackgroundFetch.scheduleTask).toHaveBeenCalledWith(
        expect.objectContaining({
          taskId: 'test-task',
          delay: 0,
          periodic: true,
        })
      );
    });

    it('should prevent duplicate task registration', async () => {
      const taskHandler = jest.fn();
      await backgroundTaskManager.registerTask({
        id: 'test-task',
        handler: taskHandler,
        interval: 15 * 60 * 1000,
        priority: 'normal',
        requiresNetwork: true,
      });

      await expect(
        backgroundTaskManager.registerTask({
          id: 'test-task',
          handler: taskHandler,
          interval: 15 * 60 * 1000,
          priority: 'normal',
          requiresNetwork: true,
        })
      ).rejects.toThrow();
    });
  });

  describe('Task Execution', () => {
    it('should execute tasks based on battery state', async () => {
      const taskHandler = jest.fn();
      
      // Mock batterie normale
      (batteryOptimizer.shouldExecuteBackgroundTask as jest.Mock).mockReturnValue(true);

      await backgroundTaskManager.registerTask({
        id: 'test-task',
        handler: taskHandler,
        interval: 15 * 60 * 1000,
        priority: 'normal',
        requiresNetwork: true,
      });

      // Simuler l'exécution de la tâche
      await (BackgroundFetch as any).__triggerTask('test-task');
      
      expect(taskHandler).toHaveBeenCalled();
    });

    it('should skip low priority tasks in low battery mode', async () => {
      const taskHandler = jest.fn();
      
      // Mock batterie faible
      (batteryOptimizer.shouldExecuteBackgroundTask as jest.Mock).mockReturnValue(false);

      await backgroundTaskManager.registerTask({
        id: 'test-task',
        handler: taskHandler,
        interval: 15 * 60 * 1000,
        priority: 'low',
        requiresNetwork: true,
      });

      // Simuler l'exécution de la tâche
      await (BackgroundFetch as any).__triggerTask('test-task');
      
      expect(taskHandler).not.toHaveBeenCalled();
    });
  });

  describe('Task Management', () => {
    it('should unregister tasks correctly', async () => {
      const taskHandler = jest.fn();
      await backgroundTaskManager.registerTask({
        id: 'test-task',
        handler: taskHandler,
        interval: 15 * 60 * 1000,
        priority: 'normal',
        requiresNetwork: true,
      });

      await backgroundTaskManager.unregisterTask('test-task');
      
      expect(BackgroundFetch.stopTask).toHaveBeenCalledWith('test-task');
    });

    it('should provide task status', async () => {
      const taskHandler = jest.fn();
      await backgroundTaskManager.registerTask({
        id: 'test-task',
        handler: taskHandler,
        interval: 15 * 60 * 1000,
        priority: 'normal',
        requiresNetwork: true,
      });

      const status = await backgroundTaskManager.getTaskStatus('test-task');
      
      expect(status.isRegistered).toBe(true);
    });
  });

  describe('Task Optimization', () => {
    it('should optimize task schedule based on battery state', async () => {
      // Mock batterie faible
      (batteryOptimizer.getCurrentBatteryInfo as jest.Mock).mockReturnValue({
        level: 0.1,
        isCharging: false,
        lowPowerMode: true,
      });

      const lowPriorityTask = jest.fn();
      const highPriorityTask = jest.fn();

      await backgroundTaskManager.registerTask({
        id: 'low-priority-task',
        handler: lowPriorityTask,
        interval: 15 * 60 * 1000,
        priority: 'low',
        requiresNetwork: true,
      });

      await backgroundTaskManager.registerTask({
        id: 'high-priority-task',
        handler: highPriorityTask,
        interval: 15 * 60 * 1000,
        priority: 'high',
        requiresNetwork: true,
      });

      await backgroundTaskManager.optimizeTaskSchedule();

      const lowPriorityStatus = await backgroundTaskManager.getTaskStatus('low-priority-task');
      const highPriorityStatus = await backgroundTaskManager.getTaskStatus('high-priority-task');

      expect(lowPriorityStatus.isRegistered).toBe(false);
      expect(highPriorityStatus.isRegistered).toBe(true);
    });
  });
});
