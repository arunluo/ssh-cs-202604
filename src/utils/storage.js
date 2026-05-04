const KEYS = {
  DRINK_RECORDS: 'drink_records',
  USER_PROFILE: 'user_profile',
  REMINDER_CONFIG: 'reminder_config',
  ACHIEVEMENTS: 'achievements',
  STREAK_DATA: 'streak_data',
  APP_SETTINGS: 'app_settings'
};

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

  addDrinkRecord(amount) {
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

    if (!todayRecord) {
      const profile = this.getUserProfile();
      todayRecord = {
        date: today,
        target: profile && profile.defaultTarget ? profile.defaultTarget : 2000,
        records: []
      };
      records.unshift(todayRecord);
    }

    todayRecord.records.push({ id: id, time: time, amount: numAmount });
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
      { id: 'perfect_day', name: '今日完美', description: '当日100%达标', unlockedAt: null, progress: 0, total: 1, icon: '⭐' }
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

module.exports = storage;
