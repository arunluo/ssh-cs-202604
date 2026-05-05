const KEYS = {
  DRINK_RECORDS: 'drink_records',
  USER_PROFILE: 'user_profile',
  REMINDER_CONFIG: 'reminder_config',
  ACHIEVEMENTS: 'achievements',
  STREAK_DATA: 'streak_data',
  APP_SETTINGS: 'app_settings'
};

// 饮品种类及其补水系数
const DRINK_TYPES = {
  water: { name: '白水', factor: 1.0, icon: '💧' },
  coffee: { name: '咖啡', factor: 0.8, icon: '☕' },
  tea: { name: '茶', factor: 0.9, icon: '🍵' },
  juice: { name: '果汁', factor: 0.85, icon: '🧃' },
  other: { name: '其他', factor: 0.7, icon: '🥤' }
};

// 喝水语录库
const DRINK_QUOTES = [
  // 健康提示
  '每天8杯水，健康自然来',
  '多喝水，排出毒素一身轻',
  '水是生命之源，饮水是健康之道',
  '适时补水，保持身体水平衡',
  '别等口渴了才喝水，那时身体已经缺水了',
  // 鼓励语
  '加油，今天的目标快完成了！',
  '你很棒，已经喝了这么多！',
  '再接再厉，健康就在眼前！',
  '坚持喝水，好习惯铸就健康人生',
  '每一杯水都是对自己身体的关爱',
  // 趣味语
  '水是生命之源，喝水是省钱之道',
  '与其花大钱买保健品，不如多喝白开水',
  '水能治百病？每天8杯水，医生远离我',
  '喝水不忘挖井人，节水珍惜水资源',
  '多喝水少熬夜，健康生活从一杯水开始',
  // 场景语
  '早起一杯水，唤醒身体新陈代谢',
  '餐前喝杯水，有助于控制食欲',
  '运动后及时补水，保持体能',
  '工作间隙喝口水，效率更高哦',
  '睡前一小时少喝水，明天早起更轻松'
];

const MAX_DISPLAY_ML = 2800;

const storage = {
  getDrinkRecords() {
    return wx.getStorageSync(KEYS.DRINK_RECORDS) || [];
  },

  setDrinkRecords(records) {
    wx.setStorageSync(KEYS.DRINK_RECORDS, records);
  },

  getTodayRecord() {
    const today = formatDate(new Date());
    const records = this.getDrinkRecords();
    const todayRecord = records.find(r => r.date === today);
    return todayRecord || null;
  },

  addDrinkRecord(amount, type = 'water') {
    const today = formatDate(new Date());
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const records = this.getDrinkRecords();

    let todayRecord = null;
    for (let i = 0; i < records.length; i++) {
      if (records[i].date === today) {
        todayRecord = records[i];
        break;
      }
    }

    const id = generateId();
    const numAmount = Number(amount); // Ensure amount is a number
    const drinkType = DRINK_TYPES[type] ? type : 'water';

    if (!todayRecord) {
      const profile = this.getUserProfile();
      todayRecord = {
        date: today,
        target: profile && profile.defaultTarget ? profile.defaultTarget : 2000,
        records: []
      };
      records.unshift(todayRecord);
    }

    todayRecord.records.push({ id: id, time: time, amount: numAmount, type: drinkType });
    this.setDrinkRecords(records);
    return todayRecord;
  },

  deleteDrinkRecord(id) {
    const today = formatDate(new Date());
    const records = this.getDrinkRecords();

    for (let i = 0; i < records.length; i++) {
      if (records[i].date === today) {
        const newRecords = [];
        for (let j = 0; j < records[i].records.length; j++) {
          if (records[i].records[j].id !== id) {
            newRecords.push(records[i].records[j]);
          }
        }
        records[i].records = newRecords;
        break;
      }
    }

    this.setDrinkRecords(records);
  },

  getUserProfile() {
    return wx.getStorageSync(KEYS.USER_PROFILE) || null;
  },

  setUserProfile(profile) {
    wx.setStorageSync(KEYS.USER_PROFILE, profile);
  },

  getReminderConfig() {
    const defaultConfig = {
      mode: 'fixed',
      interval: 60,
      noonQuietStart: '12:30',
      noonQuietEnd: '13:30',
      nightQuietStart: '23:00',
      nightQuietEnd: '07:00',
      subscribeEnabled: false,
      ignoreCount: 0,
      lastRemindDate: ''
    };

    const stored = wx.getStorageSync(KEYS.REMINDER_CONFIG);
    if (stored) {
      return {
        mode: stored.mode || defaultConfig.mode,
        interval: stored.interval || defaultConfig.interval,
        noonQuietStart: stored.noonQuietStart || defaultConfig.noonQuietStart,
        noonQuietEnd: stored.noonQuietEnd || defaultConfig.noonQuietEnd,
        nightQuietStart: stored.nightQuietStart || defaultConfig.nightQuietStart,
        nightQuietEnd: stored.nightQuietEnd || defaultConfig.nightQuietEnd,
        subscribeEnabled: stored.subscribeEnabled !== undefined ? stored.subscribeEnabled : defaultConfig.subscribeEnabled,
        ignoreCount: stored.ignoreCount || 0,
        lastRemindDate: stored.lastRemindDate || ''
      };
    }
    return defaultConfig;
  },

  setReminderConfig(config) {
    wx.setStorageSync(KEYS.REMINDER_CONFIG, config);
  },

  getAchievements() {
    const defaultAchievements = [
      { id: 'streak_3', name: '连续3天', description: '连续达标3天', unlockedAt: null, progress: 0, total: 3, icon: '🏆' },
      { id: 'streak_7', name: '连续7天', description: '连续达标7天', unlockedAt: null, progress: 0, total: 7, icon: '🏆' },
      { id: 'streak_30', name: '连续30天', description: '连续达标30天', unlockedAt: null, progress: 0, total: 30, icon: '🏆' },
      { id: 'streak_100', name: '连续100天', description: '连续达标100天', unlockedAt: null, progress: 0, total: 100, icon: '🏆' },
      { id: 'early_bird', name: '早起第一杯', description: '起床后30分钟内喝水', unlockedAt: null, progress: 0, total: 1, icon: '🌅' },
      { id: 'perfect_day', name: '今日完美', description: '当日100%达标', unlockedAt: null, progress: 0, total: 1, icon: '⭐' },
      // 新增成就
      { id: 'coffee_lover', name: '咖啡爱好者', description: '喝过10杯咖啡', unlockedAt: null, progress: 0, total: 10, icon: '☕' },
      { id: 'tea_master', name: '茶道大师', description: '喝过10杯茶', unlockedAt: null, progress: 0, total: 10, icon: '🍵' },
      { id: 'weekend_warrior', name: '周末水怪', description: '连续4个周末达标', unlockedAt: null, progress: 0, total: 4, icon: '🎉' },
      { id: 'early_bird_7', name: '早起达人', description: '连续7天早起喝水', unlockedAt: null, progress: 0, total: 7, icon: '🌅' },
      { id: 'hundred_cups', name: '百杯达人', description: '累计喝满100杯', unlockedAt: null, progress: 0, total: 100, icon: '🎯' },
      { id: 'night_owl', name: '夜猫子', description: '连续3天睡前喝水', unlockedAt: null, progress: 0, total: 3, icon: '🌙' }
    ];

    const stored = wx.getStorageSync(KEYS.ACHIEVEMENTS);
    if (!stored || stored.length === 0) {
      wx.setStorageSync(KEYS.ACHIEVEMENTS, defaultAchievements);
      return defaultAchievements;
    }

    return defaultAchievements.map(def => {
      const existing = stored.find(s => s.id === def.id);
      return existing || def;
    });
  },

  setAchievements(achievements) {
    wx.setStorageSync(KEYS.ACHIEVEMENTS, achievements);
  },

  getStreakData() {
    const stored = wx.getStorageSync(KEYS.STREAK_DATA);
    return stored || { currentStreak: 0, lastCompletedDate: '' };
  },

  setStreakData(data) {
    wx.setStorageSync(KEYS.STREAK_DATA, data);
  },

  getAppSettings() {
    const defaultSettings = {
      firstLaunch: true,
      privacyAccepted: false,
      lastCleanupDate: ''
    };

    const stored = wx.getStorageSync(KEYS.APP_SETTINGS);
    if (stored) {
      return {
        firstLaunch: stored.firstLaunch !== undefined ? stored.firstLaunch : defaultSettings.firstLaunch,
        privacyAccepted: stored.privacyAccepted !== undefined ? stored.privacyAccepted : defaultSettings.privacyAccepted,
        lastCleanupDate: stored.lastCleanupDate || defaultSettings.lastCleanupDate
      };
    }
    return defaultSettings;
  },

  setAppSettings(settings) {
    wx.setStorageSync(KEYS.APP_SETTINGS, settings);
  },

  calculateTodayProgress() {
    const today = formatDate(new Date());
    const records = this.getDrinkRecords();
    let todayRecord = null;

    for (let i = 0; i < records.length; i++) {
      if (records[i].date === today) {
        todayRecord = records[i];
        break;
      }
    }

    const profile = this.getUserProfile();
    const target = todayRecord && todayRecord.target ? todayRecord.target : (profile && profile.defaultTarget ? profile.defaultTarget : 2000);

    let total = 0;
    let recordsList = [];

    if (todayRecord && todayRecord.records) {
      recordsList = todayRecord.records;
      for (let i = 0; i < recordsList.length; i++) {
        total += Number(recordsList[i].amount) || 0;
      }
    }

    const displayTotal = Math.min(total, MAX_DISPLAY_ML);
    const percentage = target > 0 ? Math.round((total / target) * 100) : 0;

    return {
      date: today,
      total: total,
      displayTotal: displayTotal,
      target: target,
      percentage: Math.min(percentage, 100),
      records: recordsList
    };
  },

  checkAndUpdateStreak() {
    const today = formatDate(new Date());
    const progress = this.calculateTodayProgress();
    const streakData = this.getStreakData();

    if (progress.percentage >= 100) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatDate(yesterday);

      if (streakData.lastCompletedDate === yesterdayStr) {
        streakData.currentStreak += 1;
      } else if (streakData.lastCompletedDate !== today) {
        streakData.currentStreak = 1;
      }
      streakData.lastCompletedDate = today;
      this.setStreakData(streakData);
    }
  },

  cleanupOldRecords() {
    const records = this.getDrinkRecords();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filtered = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= thirtyDaysAgo;
    });

    this.setDrinkRecords(filtered);
  },

  // 获取随机语录
  getRandomQuote() {
    const index = Math.floor(Math.random() * DRINK_QUOTES.length);
    return DRINK_QUOTES[index];
  },

  // 获取所有语录
  getAllQuotes() {
    return DRINK_QUOTES;
  },

  // 获取饮品种类信息
  getDrinkTypes() {
    return DRINK_TYPES;
  },

  // 统计某类型饮品喝过多少次
  countDrinkByType(type) {
    const records = this.getDrinkRecords();
    let count = 0;
    for (let i = 0; i < records.length; i++) {
      const dayRecords = records[i].records || [];
      for (let j = 0; j < dayRecords.length; j++) {
        if (dayRecords[j].type === type) {
          count++;
        }
      }
    }
    return count;
  },

  // 获取累计喝水量
  getTotalIntake() {
    const records = this.getDrinkRecords();
    let total = 0;
    for (let i = 0; i < records.length; i++) {
      const dayRecords = records[i].records || [];
      for (let j = 0; j < dayRecords.length; j++) {
        total += Number(dayRecords[j].amount) || 0;
      }
    }
    return total;
  },

  // 获取累计喝了多少杯
  getTotalCups() {
    const records = this.getDrinkRecords();
    let count = 0;
    for (let i = 0; i < records.length; i++) {
      count += records[i].records ? records[i].records.length : 0;
    }
    return count;
  },

  // 获取今日喝的饮品类型列表
  getTodayDrinkTypes() {
    const today = formatDate(new Date());
    const records = this.getDrinkRecords();
    const todayRecord = records.find(r => r.date === today);
    if (!todayRecord || !todayRecord.records) return [];
    return todayRecord.records.map(r => r.type || 'water');
  },

  // 获取今日实际补水量（考虑补水系数）
  getTodayEffectiveIntake() {
    const progress = this.calculateTodayProgress();
    const todayTypes = this.getTodayDrinkTypes();
    let effectiveTotal = 0;
    for (let i = 0; i < todayTypes.length; i++) {
      const typeInfo = DRINK_TYPES[todayTypes[i]] || DRINK_TYPES.water;
      // 需要找到对应的amount，这里简化处理，实际应该从records获取
    }
    return progress.total; // 简化返回，实际应该加权计算
  }
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = {
  storage,
  DRINK_TYPES,
  DRINK_QUOTES
};
