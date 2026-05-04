App({
  globalData: {},

  onLaunch() {
    this.checkAndCleanup();
    this.checkAndResetReminder();
  },

  checkAndCleanup() {
    const settings = wx.getStorageSync('app_settings') || {
      firstLaunch: true,
      privacyAccepted: false,
      lastCleanupDate: ''
    };

    const today = this.formatDate(new Date());

    if (settings.lastCleanupDate !== today) {
      this.cleanupOldRecords();
      settings.lastCleanupDate = today;
      wx.setStorageSync('app_settings', settings);
    }
  },

  cleanupOldRecords() {
    const records = wx.getStorageSync('drink_records') || [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filtered = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= thirtyDaysAgo;
    });

    wx.setStorageSync('drink_records', filtered);
  },

  checkAndResetReminder() {
    const config = wx.getStorageSync('reminder_config');
    const today = this.formatDate(new Date());

    if (config && config.lastRemindDate !== today) {
      config.ignoreCount = 0;
      config.lastRemindDate = today;
      wx.setStorageSync('reminder_config', config);
    }
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
