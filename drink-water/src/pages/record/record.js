const storage = require('../../utils/storage').storage;

Page({
  data: {
    activeTab: 'today',
    todayRecords: [],
    weekData: [],
    selectedDate: '',
    selectedDateRecords: [],
    // 新增：趋势相关数据
    trendData: [],
    averageIntake: 0,
    completionRate: 0,
    totalDays: 0,
    completedDays: 0,
    showMonth: false,
    // 周报数据
    showWeekReport: false,
    weekReport: {
      weekAvg: 0,
      lastWeekAvg: 0,
      comparison: '',
      bestDay: '',
      completedDays: 0,
      suggestions: []
    }
  },

  onShow() {
    this.loadTodayRecords();
    this.loadWeekData();
    this.loadTrendData();
    this.loadWeekReport();
  },

  onPullDownRefresh() {
    this.loadTodayRecords();
    this.loadWeekData();
    this.loadTrendData();
    this.loadWeekReport();
    wx.stopPullDownRefresh();
  },

  loadTodayRecords() {
    const todayRecord = storage.getTodayRecord();
    const records = todayRecord ? todayRecord.records || [] : [];
    const sortedRecords = [...records].reverse();
    this.setData({ todayRecords: sortedRecords });
  },

  loadWeekData() {
    const records = storage.getDrinkRecords();
    const today = new Date();
    const weekData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const record = records.find(r => r.date === dateStr);
      const total = record && record.records ? record.records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0) : 0;
      const target = record && record.target ? record.target : (storage.getUserProfile() && storage.getUserProfile().defaultTarget) || 2000;
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      weekData.push({
        date: dateStr,
        day: dayNames[date.getDay()],
        total,
        target,
        percentage: target > 0 ? Math.round((total / target) * 100) : 0
      });
    }

    this.setData({ weekData });
  },

  // 加载趋势数据
  loadTrendData() {
    const records = storage.getDrinkRecords();
    const profile = storage.getUserProfile();
    const target = profile?.defaultTarget || 2000;
    const today = new Date();
    const displayDays = this.data.showMonth ? 30 : 7;

    const trendData = [];
    let totalIntake = 0;
    let completedDays = 0;

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

  // 加载周报数据
  loadWeekReport() {
    const records = storage.getDrinkRecords();
    const profile = storage.getUserProfile();
    const target = profile?.defaultTarget || 2000;
    const today = new Date();

    // 本周数据
    let thisWeekTotal = 0;
    let thisWeekDays = 0;
    const thisWeekData = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const record = records.find(r => r.date === dateStr);
      if (record && record.records && record.records.length > 0) {
        const dayTotal = record.records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        thisWeekTotal += dayTotal;
        thisWeekDays++;
        thisWeekData.push({ date: dateStr, total: dayTotal, percentage: target > 0 ? Math.round((dayTotal / target) * 100) : 0 });
      }
    }

    // 上周数据
    let lastWeekTotal = 0;
    let lastWeekDays = 0;
    for (let i = 7; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const record = records.find(r => r.date === dateStr);
      if (record && record.records && record.records.length > 0) {
        const dayTotal = record.records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
        lastWeekTotal += dayTotal;
        lastWeekDays++;
      }
    }

    const weekAvg = thisWeekDays > 0 ? Math.round(thisWeekTotal / thisWeekDays) : 0;
    const lastWeekAvg = lastWeekDays > 0 ? Math.round(lastWeekTotal / lastWeekDays) : 0;

    // 计算环比
    let comparison = '';
    if (lastWeekAvg > 0) {
      const change = ((weekAvg - lastWeekAvg) / lastWeekAvg * 100).toFixed(1);
      comparison = change >= 0 ? `+${change}%` : `${change}%`;
    } else if (weekAvg > 0) {
      comparison = '新开始';
    }

    // 找出最佳日期
    let bestDay = '';
    if (thisWeekData.length > 0) {
      const best = thisWeekData.reduce((prev, curr) => curr.total > prev.total ? curr : prev);
      const date = new Date(best.date);
      const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      bestDay = dayNames[date.getDay()];
    }

    // 生成建议
    const suggestions = this.generateSuggestions(thisWeekData, weekAvg, lastWeekAvg, profile);

    // 计算本周达标天数
    const completedDays = thisWeekData.filter(d => d.percentage >= 100).length;

    this.setData({
      weekReport: {
        weekAvg,
        lastWeekAvg,
        comparison,
        bestDay,
        completedDays,
        suggestions
      }
    });
  },

  // 生成个性化建议
  generateSuggestions(weekData, weekAvg, lastWeekAvg, profile) {
    const suggestions = [];
    let morningTotal = 0, afternoonTotal = 0, eveningTotal = 0;
    const records = storage.getDrinkRecords();

    for (let i = 0; i < Math.min(7, records.length); i++) {
      const dayRecords = records[i].records || [];
      for (let j = 0; j < dayRecords.length; j++) {
        const hour = parseInt(dayRecords[j].time.split(':')[0]);
        if (hour >= 6 && hour < 12) morningTotal += dayRecords[j].amount;
        else if (hour >= 12 && hour < 18) afternoonTotal += dayRecords[j].amount;
        else if (hour >= 18 && hour < 22) eveningTotal += dayRecords[j].amount;
      }
    }

    if (afternoonTotal < morningTotal * 0.5) {
      suggestions.push('你的下午喝水较少，建议在 14:00-16:00 增加饮水');
    }

    if (eveningTotal < morningTotal * 0.3) {
      suggestions.push('晚间喝水较少，注意晚餐后也要补充水分');
    }

    const today = new Date();
    for (let i = 0; i < 2; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = this.formatDate(date);
      const record = records.find(r => r.date === dateStr);
      if (!record || !record.records || record.records.length === 0) {
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          suggestions.push('周末饮水达标率较低，注意保持哦');
          break;
        }
      }
    }

    if (suggestions.length === 0) {
      if (weekAvg >= (profile?.defaultTarget || 2000)) {
        suggestions.push('继续保持，你的水分摄入很健康！');
      } else {
        suggestions.push('记得每天喝够目标水量，健康从一杯水开始');
      }
    }

    return suggestions;
  },

  onToggleMode() {
    this.setData({ showMonth: !this.data.showMonth }, () => {
      this.loadTrendData();
    });
  },

  onTabChange(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onDeleteRecord(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除记录',
      content: '确定要删除这条饮水记录吗？',
      success: (res) => {
        if (res.confirm) {
          storage.deleteDrinkRecord(id);
          this.loadTodayRecords();
          this.loadWeekData();
          wx.showToast({ title: '已删除', icon: 'success' });
        }
      }
    });
  },

  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});