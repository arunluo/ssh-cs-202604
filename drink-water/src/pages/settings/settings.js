const storage = require('../../utils/storage');

Page({
  data: {
    profile: null,
    target: '',
    reminderConfig: {},
    wakeTime: '07:30',
    interval: '60'
  },

  onShow() {
    this.loadSettings();
  },

  loadSettings() {
    const profile = storage.getUserProfile();
    const config = storage.getReminderConfig();

    this.setData({
      profile,
      target: profile?.defaultTarget?.toString() || '2000',
      reminderConfig: config,
      wakeTime: profile?.wakeTime || '07:30',
      interval: config?.interval?.toString() || '60'
    });
  },

  onGenderChange(e) {
    const gender = e.detail.value;
    this.updateProfile({ gender });
  },

  onWeightInput(e) {
    const weight = parseInt(e.detail.value) || 0;
    this.updateProfile({ weight });
  },

  onWakeTimeChange(e) {
    const wakeTime = e.detail.value;
    this.setData({ wakeTime });
    this.updateProfile({ wakeTime });
  },

  onTargetInput(e) {
    const target = parseInt(e.detail.value) || 0;
    this.setData({ target: target.toString() });
    this.updateProfile({ defaultTarget: target });
  },

  onIntervalChange(e) {
    const interval = e.detail.value;
    this.setData({ interval });
    const config = storage.getReminderConfig();
    config.interval = parseInt(interval);
    storage.setReminderConfig(config);
  },

  onSubscribeManage() {
    wx.openSetting({
      success: (res) => {
        if (res.authSetting['scope.notify']) {
          wx.showToast({ title: '已开启订阅', icon: 'success' });
        }
      }
    });
  },

  onRequestSubscribe() {
    wx.requestSubscribeMessage({
      tmplIds: ['YOUR_TEMPLATE_ID'],
      success: (res) => {
        if (res.errMsg === 'requestSubscribeMessage:ok') {
          const config = storage.getReminderConfig();
          config.subscribeEnabled = true;
          storage.setReminderConfig(config);
          wx.showToast({ title: '开启成功', icon: 'success' });
        }
      },
      fail: () => {
        wx.showToast({ title: '未开启', icon: 'none' });
      }
    });
  },

  updateProfile(updates) {
    const profile = storage.getUserProfile() || {
      gender: 'male',
      weight: 65,
      wakeTime: '07:30',
      defaultTarget: 2000
    };

    const newProfile = { ...profile, ...updates };
    storage.setUserProfile(newProfile);
    this.setData({ profile: newProfile });
  },

  onClearData() {
    wx.showModal({
      title: '清除数据',
      content: '确定要清除所有饮水记录吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          storage.setDrinkRecords([]);
          storage.setStreakData({ currentStreak: 0, lastCompletedDate: '' });
          storage.setAchievements(storage.getAchievements());
          wx.showToast({ title: '已清除', icon: 'success' });
        }
      }
    });
  },

  onPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '喝喝水小程序所有数据均存储在本地设备，不会上传至任何服务器。我们仅在您主动授权时使用微信订阅消息功能进行喝水提醒。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  onAbout() {
    wx.showModal({
      title: '关于喝喝水',
      content: '版本: 1.0.0\n\n一个温柔提醒你喝水的助手小程序',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  updateProfileField(field, value) {
    const profile = storage.getUserProfile();
    if (profile) {
      profile[field] = value;
      storage.setUserProfile(profile);
    }
  }
});
