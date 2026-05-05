const storage = require('../../utils/storage').storage;

Page({
  data: {
    achievements: [],
    unlockedCount: 0,
    totalCount: 0
  },

  onShow() {
    this.loadAchievements();
  },

  loadAchievements() {
    const achievements = storage.getAchievements();
    const unlockedCount = achievements.filter(a => a.unlockedAt).length;
    const totalCount = achievements.length;
    this.setData({ achievements, unlockedCount, totalCount });
  },

  onBadgeTap(e) {
    const achievement = e.currentTarget.dataset.achievement;
    let message = achievement.description;

    if (achievement.unlockedAt) {
      message = `🎉 ${achievement.name}\n已于 ${achievement.unlockedAt} 解锁`;
    } else {
      const progress = achievement.progress || 0;
      message = `🔒 ${achievement.name}\n${achievement.description}\n进度: ${progress}/${achievement.total}`;
    }

    wx.showModal({
      title: achievement.name,
      content: message,
      showCancel: false,
      confirmText: '知道了'
    });
  }
});
