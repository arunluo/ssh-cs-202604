const storage = require('../../utils/storage').storage;

Page({
  data: {
    streak: 0,
    todayProgress: 0,
    totalIntake: 0,
    achievementCount: 0,
    unlockedAchievements: [],
    posterGenerated: false
  },

  onLoad() {
    this.loadShareData();
    // 开启分享功能
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  // 自定义分享内容
  onShareAppMessage() {
    const streakData = storage.getStreakData();
    const progress = storage.calculateTodayProgress();
    return {
      title: '💧 我的喝水成就 - 连续达标' + streakData.currentStreak + '天',
      desc: '今日已喝 ' + progress.percentage + '%，快来一起喝水吧！',
      path: '/pages/index/index?from=share'
    };
  },

  onShow() {
    // 避免重复生成海报导致超时
    if (!this.data.posterGenerated) {
      this.generatePoster();
    }
  },

  loadShareData() {
    const streakData = storage.getStreakData();
    const progress = storage.calculateTodayProgress();
    const achievements = storage.getAchievements();
    const totalIntake = storage.getTotalIntake();

    const unlockedAchievements = achievements.filter(a => a.unlockedAt);

    this.setData({
      streak: streakData.currentStreak,
      todayProgress: progress.percentage,
      totalIntake: totalIntake,
      achievementCount: unlockedAchievements.length,
      unlockedAchievements: unlockedAchievements.slice(0, 6)
    });

    // 生成海报（延迟执行避免阻塞）
    setTimeout(() => {
      this.generatePoster();
      this.setData({ posterGenerated: true });
    }, 100);
  },

  generatePoster() {
    const ctx = wx.createCanvasContext('shareCanvas');
    const width = 540;
    const height = 720;

    // 背景渐变 - 蓝色系
    ctx.setFillStyle('#4AADEA');
    ctx.fillRect(0, 0, width, height);

    // 顶部装饰
    ctx.setFillStyle('#5BC8F5');
    ctx.fillRect(0, 0, width, 160);

    // 标题
    ctx.setFillStyle('#FFFFFF');
    ctx.setFontSize(40);
    ctx.setTextAlign('center');
    ctx.fillText('喝喝水', width / 2, 60);

    ctx.setFontSize(24);
    ctx.fillText('我的喝水成就', width / 2, 100);

    // 分隔线
    ctx.setStrokeStyle('rgba(255,255,255,0.5)');
    ctx.setLineWidth(2);
    ctx.beginPath();
    ctx.moveTo(80, 140);
    ctx.lineTo(460, 140);
    ctx.stroke();

    // 统计数据区域 - 白色卡片
    this.drawRoundedRect(ctx, 40, 160, 460, 160, 16, '#FFFFFF');
    ctx.setFillStyle('#333333');
    ctx.setFontSize(20);
    ctx.setTextAlign('center');

    // 第一行统计数据
    const statsY1 = 210;
    const statsY2 = 260;
    const startX = 90;
    const step = 120;

    // 连续达标
    ctx.fillText('🔥', startX, statsY1);
    ctx.setFontSize(32);
    ctx.fillText(this.data.streak + '天', startX, statsY2);
    ctx.setFontSize(18);
    ctx.setFillStyle('#666666');
    ctx.fillText('连续达标', startX, statsY2 + 28);

    // 今日进度
    ctx.setFillStyle('#333333');
    ctx.setFontSize(20);
    ctx.fillText('💧', startX + step, statsY1);
    ctx.setFontSize(32);
    ctx.fillText(this.data.todayProgress + '%', startX + step, statsY2);
    ctx.setFontSize(18);
    ctx.setFillStyle('#666666');
    ctx.fillText('今日进度', startX + step, statsY2 + 28);

    // 累计喝水量
    ctx.setFillStyle('#333333');
    ctx.setFontSize(20);
    ctx.fillText('📊', startX + step * 2, statsY1);
    ctx.setFontSize(32);
    ctx.fillText(this.formatNumber(this.data.totalIntake), startX + step * 2, statsY2);
    ctx.setFontSize(18);
    ctx.setFillStyle('#666666');
    ctx.fillText('累计(ml)', startX + step * 2, statsY2 + 28);

    // 解锁成就
    ctx.setFillStyle('#FFFFFF');
    ctx.setFontSize(30);
    ctx.setTextAlign('center');
    ctx.fillText('🏆 已解锁 ' + this.data.achievementCount + ' 个成就', width / 2, 370);

    // 成就徽章区域
    const achievements = this.data.unlockedAchievements;
    if (achievements.length > 0) {
      this.drawRoundedRect(ctx, 40, 400, 460, 180, 16, '#FFFFFF');

      ctx.setFontSize(24);
      ctx.setFillStyle('#333333');
      ctx.setTextAlign('left');

      const badgeStartX = 60;
      const badgeY = 440;
      const badgeWidth = 140;
      const badgeHeight = 50;
      const cols = 3;

      for (let i = 0; i < Math.min(achievements.length, 6); i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = badgeStartX + col * badgeWidth;
        const y = badgeY + row * (badgeHeight + 10);

        // 徽章背景
        this.drawRoundedRect(ctx, x, y, 120, 44, 8, '#E8F4FD');

        // 徽章图标和名称
        ctx.setFontSize(18);
        ctx.setFillStyle('#4AADEA');
        ctx.setTextAlign('center');
        ctx.fillText(achievements[i].icon + ' ' + achievements[i].name, x + 60, y + 28);
      }
    }

    // 日期
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    ctx.setFontSize(18);
    ctx.setFillStyle('rgba(255,255,255,0.8)');
    ctx.setTextAlign('center');
    ctx.fillText(dateStr + ' 更新', width / 2, 660);

    // 小程序提示
    ctx.setFontSize(16);
    ctx.fillText('长按识别小程序码', width / 2, 690);

    ctx.draw();
  },

  drawRoundedRect(ctx, x, y, w, h, r, color) {
    ctx.setFillStyle(color);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    ctx.fill();
  },

  formatNumber(num) {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  },

  onSavePoster() {
    wx.showLoading({ title: '生成中...' });

    wx.canvasToTempFilePath({
      canvasId: 'shareCanvas',
      success: (res) => {
        wx.hideLoading();
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            wx.showToast({ title: '已保存到相册', icon: 'success' });
          },
          fail: () => {
            wx.showToast({ title: '保存失败', icon: 'none' });
          }
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '生成失败', icon: 'none' });
      }
    });
  }
});