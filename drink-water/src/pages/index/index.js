const storageModule = require('../../utils/storage');
const storage = storageModule.storage;
const DRINK_TYPES = storageModule.DRINK_TYPES;

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
    recommendedTarget: 2000,
    // 新增：饮品种类选择
    selectedDrinkType: 'water',
    drinkTypes: DRINK_TYPES,
    // 新增：随机语录
    dailyQuote: '',
    lastQuoteDate: ''
  },

  onLoad() {
    this.checkFirstLaunch();
    this.loadDailyQuote();
  },

  onShow() {
    this.loadTodayProgress();
  },

  // 加载每日语录
  loadDailyQuote() {
    const settings = storage.getAppSettings();
    const today = formatDate(new Date());

    // 如果今天还没换过语录，或者没有记录，则刷新
    if (!settings.lastQuoteDate || settings.lastQuoteDate !== today) {
      const quote = storage.getRandomQuote();
      this.setData({
        dailyQuote: quote,
        lastQuoteDate: today
      });
      settings.lastQuoteDate = today;
      storage.setAppSettings(settings);
    } else {
      // 用已有的语录（如果有的话）
      this.setData({
        dailyQuote: storage.getRandomQuote()
      });
    }
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

  // 空操作函数，用于阻止事件冒泡
  noop() {},

  // 选择饮品种类
  onSelectDrinkType(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({ selectedDrinkType: type });
  },

  onSelectCup(e) {
    const amount = e.currentTarget.dataset.amount;
    const type = this.data.selectedDrinkType || 'water';
    this.recordDrink(amount, type);
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
            const type = this.data.selectedDrinkType || 'water';
            this.recordDrink(amount, type);
          } else {
            wx.showToast({ title: '请输入1-2000之间的数字', icon: 'none' });
          }
        }
      }
    });
  },

  recordDrink(amount, type) {
    this.setData({ showCupSelector: false });

    storage.addDrinkRecord(amount, type);
    const progress = storage.calculateTodayProgress();

    storage.checkAndUpdateStreak();
    this.checkAchievements();

    const animationHeight = `${Math.max(Math.min(progress.percentage, 100), 5)}%`;
    this.setData({
      drank: progress.displayTotal,
      percentage: progress.percentage,
      animationHeight: animationHeight
    });

    this.animateWaterRise(amount, type);

    if (progress.percentage >= 100 && progress.total >= amount) {
      this.triggerCelebration();
    }

    const streakData = storage.getStreakData();
    this.setData({ streak: streakData.currentStreak });
  },

  animateWaterRise(amount, type) {
    const typeInfo = DRINK_TYPES[type] || DRINK_TYPES.water;
    wx.showToast({
      title: `+${amount}ml ${typeInfo.icon}`,
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

  // 分享功能
  onShare() {
    // 跳转到分享页面
    wx.navigateTo({
      url: '/pages/share/share'
    });
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
        }
      }
    }

    // 更新早起达人进度
    this.updateEarlyBirdProgress(achievements, progress);

    if (progress.percentage >= 100) {
      const perfectDay = achievements.find(a => a.id === 'perfect_day');
      if (perfectDay && !perfectDay.unlockedAt) {
        perfectDay.unlockedAt = formatDate(new Date());
        perfectDay.progress = 1;
      }
    }

    // 更新连续达标成就
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

    // 更新新增成就
    this.updateNewAchievements(achievements, progress, streakData);

    storage.setAchievements(achievements);
  },

  // 更新早起达人成就
  updateEarlyBirdProgress(achievements, progress) {
    const profile = storage.getUserProfile();
    if (!profile || !profile.wakeTime) return;

    const records = storage.getDrinkRecords();
    let consecutiveDays = 0;
    const wakeMinutes = this.timeToMinutes(profile.wakeTime);

    for (let i = 0; i < Math.min(7, records.length); i++) {
      const dayRecord = records[i];
      if (!dayRecord.records || dayRecord.records.length === 0) break;

      const firstRecord = dayRecord.records[0];
      const recordMinutes = this.timeToMinutes(firstRecord.time);

      if (recordMinutes - wakeMinutes <= 30 && recordMinutes >= wakeMinutes) {
        consecutiveDays++;
      } else {
        break;
      }
    }

    const earlyBird7 = achievements.find(a => a.id === 'early_bird_7');
    if (earlyBird7) {
      earlyBird7.progress = consecutiveDays;
      if (consecutiveDays >= 7 && !earlyBird7.unlockedAt) {
        earlyBird7.unlockedAt = formatDate(new Date());
      }
    }
  },

  // 更新新增成就
  updateNewAchievements(achievements, progress, streakData) {
    // 咖啡爱好者
    const coffeeCount = storage.countDrinkByType('coffee');
    const coffeeLover = achievements.find(a => a.id === 'coffee_lover');
    if (coffeeLover) {
      coffeeLover.progress = Math.min(coffeeCount, coffeeLover.total);
      if (coffeeCount >= 10 && !coffeeLover.unlockedAt) {
        coffeeLover.unlockedAt = formatDate(new Date());
      }
    }

    // 茶道大师
    const teaCount = storage.countDrinkByType('tea');
    const teaMaster = achievements.find(a => a.id === 'tea_master');
    if (teaMaster) {
      teaMaster.progress = Math.min(teaCount, teaMaster.total);
      if (teaCount >= 10 && !teaMaster.unlockedAt) {
        teaMaster.unlockedAt = formatDate(new Date());
      }
    }

    // 百杯达人
    const totalCups = storage.getTotalCups();
    const hundredCups = achievements.find(a => a.id === 'hundred_cups');
    if (hundredCups) {
      hundredCups.progress = Math.min(totalCups, hundredCups.total);
      if (totalCups >= 100 && !hundredCups.unlockedAt) {
        hundredCups.unlockedAt = formatDate(new Date());
      }
    }

    // 夜猫子 - 连续3天睡前喝水
    this.updateNightOwlProgress(achievements);

    // 周末水怪
    this.updateWeekendWarriorProgress(achievements);
  },

  // 更新夜猫子成就
  updateNightOwlProgress(achievements) {
    const records = storage.getDrinkRecords();
    let consecutiveNightDrinks = 0;

    for (let i = 0; i < Math.min(3, records.length); i++) {
      const dayRecords = records[i].records || [];
      const hasNightDrink = dayRecords.some(r => {
        const hour = parseInt(r.time.split(':')[0]);
        return hour >= 21 || hour < 5;
      });

      if (hasNightDrink) {
        consecutiveNightDrinks++;
      } else {
        break;
      }
    }

    const nightOwl = achievements.find(a => a.id === 'night_owl');
    if (nightOwl) {
      nightOwl.progress = consecutiveNightDrinks;
      if (consecutiveNightDrinks >= 3 && !nightOwl.unlockedAt) {
        nightOwl.unlockedAt = formatDate(new Date());
      }
    }
  },

  // 更新周末水怪成就
  updateWeekendWarriorProgress(achievements) {
    const records = storage.getDrinkRecords();
    let consecutiveWeekends = 0;

    for (let i = 0; i < Math.min(4, records.length); i++) {
      const record = records[i];
      const date = new Date(record.date);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isWeekend && record.records && record.records.length > 0) {
        const total = record.records.reduce((sum, r) => sum + Number(r.amount), 0);
        if (total >= record.target) {
          consecutiveWeekends++;
        } else {
          break;
        }
      } else if (isWeekend) {
        break;
      }
    }

    const weekendWarrior = achievements.find(a => a.id === 'weekend_warrior');
    if (weekendWarrior) {
      weekendWarrior.progress = consecutiveWeekends;
      if (consecutiveWeekends >= 4 && !weekendWarrior.unlockedAt) {
        weekendWarrior.unlockedAt = formatDate(new Date());
      }
    }
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
