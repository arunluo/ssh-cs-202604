const storage = require('./storage').storage;

// 预设提醒模板
const REMINDER_TEMPLATES = [
  '你的细胞正在喊渴！💧',
  '再不喝水，皮肤要闹脾气了哦',
  '喝水时间到！起来接杯水活动一下',
  '今日进度${progress}%，再喝两杯就达标啦',
  '身体：我渴了。你：等会儿。身体：???',
  '不喝水的打工人不是好打工人',
  '喝水防困，比咖啡靠谱',
  '听说喝水的人运气不会太差',
  '一杯水下肚，烦恼全清除',
  '你的小身体值得被好好对待～',
  '好久没喝水了，站起来动一动吧',
  '健康提示：及时补水很重要哦',
  '💧 喝水提醒：关爱身体从一杯水开始'
];

// 用户自定义提醒文案（可配置）
let customMessages = [];

// 获取提醒配置
function getReminderConfig() {
  const config = storage.getReminderConfig();
  // 如果有自定义文案，合并到配置中
  if (config.customMessages && config.customMessages.length > 0) {
    customMessages = config.customMessages;
  }
  return config;
}

// 设置自定义提醒文案
function setCustomMessages(messages) {
  customMessages = messages;
  const config = storage.getReminderConfig();
  config.customMessages = messages;
  storage.setReminderConfig(config);
}

// 获取有效提醒文案（自定义优先，其次预设）
function getAvailableMessages() {
  if (customMessages.length > 0) {
    return [...customMessages, ...REMINDER_TEMPLATES];
  }
  return REMINDER_TEMPLATES;
}

function checkShouldRemind() {
  const config = getReminderConfig();
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  if (!config.subscribeEnabled) {
    return { shouldRemind: false, reason: '未开启订阅消息' };
  }

  if (config.ignoreCount >= 3) {
    return { shouldRemind: false, reason: '今日已忽略3次，停止提醒' };
  }

  if (isInQuietPeriod(currentTime, config)) {
    return { shouldRemind: false, reason: '在勿扰时段内' };
  }

  if (config.lastRemindDate) {
    const lastRemind = new Date(config.lastRemindDate);
    const minutesSinceLastRemind = (now.getTime() - lastRemind.getTime()) / (1000 * 60);

    if (minutesSinceLastRemind < config.interval) {
      const remaining = Math.ceil(config.interval - minutesSinceLastRemind);
      return { shouldRemind: false, reason: `还需${remaining}分钟` };
    }
  }

  return { shouldRemind: true, reason: '可以提醒' };
}

function isInQuietPeriod(currentTime, config) {
  const { noonQuietStart, noonQuietEnd, nightQuietStart, nightQuietEnd } = config;

  if (isTimeInRange(currentTime, noonQuietStart, noonQuietEnd)) {
    return true;
  }

  if (nightQuietStart > nightQuietEnd) {
    if (currentTime >= nightQuietStart || currentTime <= nightQuietEnd) {
      return true;
    }
  } else {
    if (isTimeInRange(currentTime, nightQuietStart, nightQuietEnd)) {
      return true;
    }
  }

  return false;
}

function isTimeInRange(time, start, end) {
  return time >= start && time <= end;
}

function recordIgnore() {
  const config = storage.getReminderConfig();
  config.ignoreCount += 1;
  config.lastRemindDate = formatDate(new Date());
  storage.setReminderConfig(config);
}

function recordSuccessfulRemind() {
  const config = storage.getReminderConfig();
  config.lastRemindDate = formatDate(new Date());
  if (config.ignoreCount > 0) {
    config.ignoreCount = 0;
  }
  storage.setReminderConfig(config);
}

function formatDate(date) {
  return date.toISOString();
}

function getRandomMessage(progress) {
  const messages = getAvailableMessages();
  const randomIndex = Math.floor(Math.random() * messages.length);
  let message = messages[randomIndex];

  if (progress > 0) {
    message = message.replace('${progress}', progress.toString());
  }

  return message;
}

// 根据起床时间计算首次提醒时间（智能调整）
function getSmartFirstReminderTime(wakeTime) {
  const profile = storage.getUserProfile();
  if (!profile || !wakeTime) return null;

  // 起床后30分钟开始提醒
  const [hours, minutes] = wakeTime.split(':').map(Number);
  let reminderMinutes = hours * 60 + minutes + 30;

  const reminderHours = Math.floor(reminderMinutes / 60);
  const reminderMins = reminderMinutes % 60;

  return `${String(reminderHours).padStart(2, '0')}:${String(reminderMins).padStart(2, '0')}`;
}

module.exports = {
  checkShouldRemind,
  recordIgnore,
  recordSuccessfulRemind,
  getRandomMessage,
  getReminderConfig,
  setCustomMessages,
  getSmartFirstReminderTime
};
