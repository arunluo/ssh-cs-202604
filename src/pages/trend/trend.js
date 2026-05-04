const storage = require('../../utils/storage');

Page({
  data: {
    trendData: [],
    averageIntake: 0,
    completionRate: 0,
    totalDays: 0,
    completedDays: 0,
    displayMode: 'week', // 'week' or 'month'
    showMonth: false
  },

  onShow() {
    this.loadTrendData();
  },

  loadTrendData() {
    const records = storage.getDrinkRecords();
    const profile = storage.getUserProfile();
    const target = profile?.defaultTarget || 2000;
    const today = new Date();
    const displayDays = this.data.showMonth ? 30 : 7;

    const trendData = [];
    let totalIntake = 0;
    let completedDays = 0;

    // Start from today and go backwards (newest first)
    for (let i = 0; i < displayDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const record = records.find(r => r.date === dateStr);
      const dayTotal = record?.records?.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) || 0;
      const percentage = target > 0 ? Math.round((dayTotal / target) * 100) : 0;

      trendData.push({
        date: dateStr,
        displayDate: `${date.getMonth() + 1}/${date.getDate()}`,
        total: dayTotal,
        target,
        percentage,
        isComplete: percentage >= 100
      });

      totalIntake += dayTotal;
      if (percentage >= 100) completedDays++;
    }

    const totalDays = displayDays;
    const averageIntake = totalDays > 0 ? Math.round(totalIntake / totalDays) : 0;
    const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

    this.setData({
      trendData,
      averageIntake,
      completionRate,
      totalDays,
      completedDays
    });
  },

  onToggleMode() {
    this.setData({ showMonth: !this.data.showMonth }, () => {
      this.loadTrendData();
    });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
