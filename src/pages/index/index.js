const storage = require('../../utils/storage');

Page({
  data: {
    showCupSelector: false,
    showCelebrate: false,
    streak: 0,
    drank: 0,
    target: 2000,
    percentage: 0,
    animationHeight: '5%',
    userProfile: null,
    isFirstLaunch: true,
    showPrivacyModal: false,
    showOnboarding: false,
    gender: 'male',
    weight: '',
    wakeTime: '07:30',
    recommendedTarget: 2000
  },

  onLoad() {
    this.checkFirstLaunch();
  },

  onShow() {
    this.loadTodayProgress();
  },

  checkFirstLaunch() {
    const settings = storage.getAppSettings();

    if (settings.firstLaunch || !settings.privacyAccepted) {
      this.setData({ showPrivacyModal: true });
    }
  },

  loadTodayProgress() {
    const progress = storage.calculateTodayProgress();
    const streakData = storage.getStreakData();
    const profile = storage.getUserProfile();

    const animationHeight = `${Math.max(Math.min(progress.percentage, 100), 5)}%`;

    this.setData({
      drank: progress.displayTotal,
      target: progress.target,
      percentage: progress.percentage,
      animationHeight: animationHeight,
      streak: streakData.currentStreak,
      userProfile: profile
    });
  },

  onPrivacyConfirm() {
    const settings = storage.getAppSettings();
    settings.privacyAccepted = true;
    storage.setAppSettings(settings);

    this.setData({ showPrivacyModal: false, showOnboarding: true });
  },

  onPrivacyCancel() {
    wx.showModal({
      title: '提示',
      content: '您需要同意隐私政策才能使用本小程序',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  onGenderChange(e) {
    const gender = e.detail.value;
    this.setData({ gender });
    this.updateRecommendedTarget();
  },

  onWeightInput(e) {
    const weight = e.detail.value;
    this.setData({ weight });
    this.updateRecommendedTarget();
  },

  onWakeTimeChange(e) {
    this.setData({ wakeTime: e.detail.value });
  },

  updateRecommendedTarget() {
    const { gender, weight } = this.data;
    const weightNum = parseInt(weight) || 0;

    if (weightNum > 0) {
      const baseTarget = gender === 'female' ? weightNum * 30 : weightNum * 35;
      this.setData({ recommendedTarget: Math.round(baseTarget / 100) * 100 });
    }
  },

  onCompleteOnboarding() {
    const { gender, weight, wakeTime, recommendedTarget } = this.data;
    const weightNum = parseInt(weight) || 65;

    const profile = {
      gender: gender,
      weight: weightNum,
      wakeTime,
      defaultTarget: recommendedTarget
    };

    storage.setUserProfile(profile);

    const config = storage.getReminderConfig();
    config.wakeTime = wakeTime;
    storage.setReminderConfig(config);

    const settings = storage.getAppSettings();
    settings.firstLaunch = false;
    storage.setAppSettings(settings);

    this.setData({ showOnboarding: false });
    this.loadTodayProgress();

    this.askForSubscription();
  },

  askForSubscription() {
    wx.showModal({
      title: '开启喝水提醒',
      content: '开启消息提醒，我会温柔地提醒你喝水～',
      confirmText: '去开启',
      cancelText: '稍后',
      success: (res) => {
        if (res.confirm) {
          this.requestSubscribeMessage();
        }
      }
    });
  },

  requestSubscribeMessage() {
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
        wx.showToast({ title: '未开启，可在设置中重新授权', icon: 'none' });
      }
    });
  },

  onTapRecord() {
    this.setData({ showCupSelector: true });
  },

  onCloseCupSelector() {
    this.setData({ showCupSelector: false });
  },

  onSelectCup(e) {
    const amount = e.currentTarget.dataset.amount;
    this.recordDrink(amount);
  },

  onCustomInput() {
    this.setData({ showCupSelector: false });

    wx.showModal({
      title: '自定义饮水量',
      editable: true,
      placeholderText: '请输入毫升数',
      success: (res) => {
        if (res.confirm && res.content) {
          const amount = parseInt(res.content);
          if (amount > 0 && amount <= 2000) {
            this.recordDrink(amount);
          } else {
            wx.showToast({ title: '请输入1-2000之间的数字', icon: 'none' });
          }
        }
      }
    });
  },

  recordDrink(amount) {
    this.setData({ showCupSelector: false });

    storage.addDrinkRecord(amount);
    const progress = storage.calculateTodayProgress();

    storage.checkAndUpdateStreak();
    this.checkAchievements();

    const animationHeight = `${Math.max(Math.min(progress.percentage, 100), 5)}%`;
    this.setData({
      drank: progress.displayTotal,
      percentage: progress.percentage,
      animationHeight: animationHeight
    });

    this.animateWaterRise(amount);

    if (progress.percentage >= 100 && progress.total >= amount) {
      this.triggerCelebration();
    }

    const streakData = storage.getStreakData();
    this.setData({ streak: streakData.currentStreak });
  },

  animateWaterRise(amount) {
    wx.showToast({
      title: `+${amount}ml`,
      icon: 'none',
      duration: 1000
    });
  },

  triggerCelebration() {
    this.setData({ showCelebrate: true });

    setTimeout(() => {
      this.setData({ showCelebrate: false });
    }, 3000);
  },

  onCloseCelebrate() {
    this.setData({ showCelebrate: false });
  },

  checkAchievements() {
    const achievements = storage.getAchievements();
    const progress = storage.calculateTodayProgress();
    const streakData = storage.getStreakData();
    const profile = storage.getUserProfile();

    if (progress.records.length === 1) {
      const record = progress.records[0];
      const [hours, minutes] = record.time.split(':').map(Number);
      const [wakeHours, wakeMinutes] = (profile && profile.wakeTime ? profile.wakeTime : '07:30').split(':').map(Number);
      const wakeMinutesTotal = wakeHours * 60 + wakeMinutes;
      const recordMinutesTotal = hours * 60 + minutes;

      if (recordMinutesTotal - wakeMinutesTotal <= 30) {
        const earlyBird = achievements.find(a => a.id === 'early_bird');
        if (earlyBird && !earlyBird.unlockedAt) {
          earlyBird.unlockedAt = formatDate(new Date());
          earlyBird.progress = 1;
          storage.setAchievements(achievements);
        }
      }
    }

    if (progress.percentage >= 100) {
      const perfectDay = achievements.find(a => a.id === 'perfect_day');
      if (perfectDay && !perfectDay.unlockedAt) {
        perfectDay.unlockedAt = formatDate(new Date());
        perfectDay.progress = 1;
        storage.setAchievements(achievements);
      }
    }

    const streakMap = {
      'streak_3': 3,
      'streak_7': 7,
      'streak_30': 30,
      'streak_100': 100
    };

    for (const key in streakMap) {
      const achievement = achievements.find(a => a.id === key);
      if (achievement) {
        achievement.progress = Math.min(streakData.currentStreak, streakMap[key]);
        if (streakData.currentStreak >= streakMap[key] && !achievement.unlockedAt) {
          achievement.unlockedAt = formatDate(new Date());
        }
      }
    }
    storage.setAchievements(achievements);
  }
});

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
