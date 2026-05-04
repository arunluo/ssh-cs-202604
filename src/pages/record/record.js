const storage = require('../../utils/storage');

Page({
  data: {
    activeTab: 'today',
    todayRecords: [],
    weekData: [],
    selectedDate: '',
    selectedDateRecords: []
  },

  onShow() {
    this.loadTodayRecords();
    this.loadWeekData();
  },

  onPullDownRefresh() {
    this.loadTodayRecords();
    this.loadWeekData();
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
