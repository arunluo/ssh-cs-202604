const storage = require('./storage');

function checkShouldRemind() {
  const config = storage.getReminderConfig();
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
  const messages = [
    '你的细胞正在喊渴！💧',
    '再不喝水，皮肤要闹脾气了哦',
    '喝水时间到！起来接杯水活动一下',
    '今日进度${progress}%，再喝两杯就达标啦',
    '身体：我渴了。你：等会儿。身体：???',
    '不喝水的打工人不是好打工人',
    '喝水防困，比咖啡靠谱',
    '听说喝水的人运气不会太差',
    '一杯水下肚，烦恼全清除',
    '你的小身体值得被好好对待～'
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  let message = messages[randomIndex];

  if (progress > 0) {
    message = message.replace('${progress}', progress.toString());
  }

  return message;
}

module.exports = {
  checkShouldRemind,
  recordIgnore,
  recordSuccessfulRemind,
  getRandomMessage
};
