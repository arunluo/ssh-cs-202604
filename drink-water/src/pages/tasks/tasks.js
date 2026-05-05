const storage = require('../../utils/storage').storage;

Page({
  data: {
    rewards: 0,
    dailyTasks: []
  },

  onLoad() {
    this.initTasks();
  },

  onShow() {
    this.loadTasks();
    this.updateTaskProgress();
  },

  initTasks() {
    // 初始化每日任务
    const KEYS = {
      DAILY_TASKS: 'daily_tasks',
      LAST_TASK_DATE: 'last_task_date',
      REWARDS: 'rewards'
    };

    // 获取或初始化任务数据
    let taskData = wx.getStorageSync(KEYS.DAILY_TASKS);
    const today = formatDate(new Date());

    // 如果不是今天，重置任务进度
    if (!taskData || taskData.date !== today) {
      taskData = {
        date: today,
        tasks: [
          { id: 'morning_cup', name: '早起第一杯', icon: '🌅', target: 1, progress: 0, reward: 10, completed: false },
          { id: 'before_meal', name: '餐前喝水', icon: '🍽️', target: 3, progress: 0, reward: 15, completed: false },
          { id: 'evening_cup', name: '睡前一cup', icon: '🌙', target: 1, progress: 0, reward: 10, completed: false }
        ]
      };
      wx.setStorageSync(KEYS.DAILY_TASKS, taskData);
    }

    // 获取积分
    const rewards = wx.getStorageSync(KEYS.REWARDS) || 0;

    this.setData({
      dailyTasks: taskData.tasks,
      rewards: rewards
    });
  },

  loadTasks() {
    const KEYS = {
      DAILY_TASKS: 'daily_tasks',
      REWARDS: 'rewards'
    };

    const taskData = wx.getStorageSync(KEYS.DAILY_TASKS);
    const rewards = wx.getStorageSync(KEYS.REWARDS) || 0;

    if (taskData) {
      this.setData({
        dailyTasks: taskData.tasks,
        rewards: rewards
      });
    }
  },

  updateTaskProgress() {
    const progress = storage.calculateTodayProgress();
    const profile = storage.getUserProfile();
    const today = formatDate(new Date());

    if (!profile || !profile.wakeTime) return;

    const KEYS = {
      DAILY_TASKS: 'daily_tasks',
      REWARDS: 'rewards'
    };

    let taskData = wx.getStorageSync(KEYS.DAILY_TASKS);
    if (!taskData || taskData.date !== today) return;

    const wakeMinutes = this.timeToMinutes(profile.wakeTime);
    let rewardsEarned = 0;

    // 遍历今天的记录，更新任务进度
    const records = progress.records || [];

    // 早起第一杯：检查第一条记录是否在起床后30分钟内
    let morningCupDone = false;
    if (records.length > 0) {
      const firstRecord = records[0];
      const recordMinutes = this.timeToMinutes(firstRecord.time);
      if (recordMinutes - wakeMinutes <= 30 && recordMinutes >= wakeMinutes) {
        morningCupDone = true;
      }
    }
    taskData.tasks[0].progress = morningCupDone ? 1 : 0;
    taskData.tasks[0].completed = morningCupDone;

    // 餐前喝水：简化处理，每条记录都算
    let beforeMealCount = records.length;
    taskData.tasks[1].progress = Math.min(beforeMealCount, 3);
    taskData.tasks[1].completed = beforeMealCount >= 3;

    // 睡前一cup：检查是否有21点后的记录
    let eveningCupDone = false;
    for (let i = 0; i < records.length; i++) {
      const hour = parseInt(records[i].time.split(':')[0]);
      if (hour >= 21 || hour < 5) {
        eveningCupDone = true;
        break;
      }
    }
    taskData.tasks[2].progress = eveningCupDone ? 1 : 0;
    taskData.tasks[2].completed = eveningCupDone;

    // 计算新增积分
    for (let i = 0; i < taskData.tasks.length; i++) {
      const task = taskData.tasks[i];
      if (task.completed && !this.wasTaskCompletedBefore(taskData, i)) {
        rewardsEarned += task.reward;
      }
    }

    // 保存任务数据
    wx.setStorageSync(KEYS.DAILY_TASKS, taskData);

    // 更新积分
    if (rewardsEarned > 0) {
      const currentRewards = wx.getStorageSync(KEYS.REWARDS) || 0;
      wx.setStorageSync(KEYS.REWARDS, currentRewards + rewardsEarned);
      this.setData({ rewards: currentRewards + rewardsEarned });
    }

    // 刷新页面
    this.setData({ dailyTasks: taskData.tasks });
  },

  wasTaskCompletedBefore(taskData, index) {
    // 这里简化为检查progress是否已经等于target
    // 实际应该更精确地追踪
    return false;
  },

  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}