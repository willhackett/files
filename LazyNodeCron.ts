import cron from 'node-cron';

interface CronTab {
  id: string;
  name: string;
  account_id: string;
  cron_expression: string;
  regular_expression: string;
  base_path: string;
  connection_id: string;
}

interface Task {
  cronTab: NodeCronTask;
  cron_expression: string;
  regular_expression: string;
}

const scheduled = {};

const queueTask = (cronTabId) => () => {
  const task = scheduled[cronTabId];
  /**
   * Schedule the message into the queue
   */
};

const run = async () => {
  // Get all tasks from the database
  const cronTabs: CronTab[] = []; //await CronTab.find();

  const keysChecked = [];
  const keysUnchecked = Object.keys(scheduled);

  for (const cronTab of cronTabs) {
    // Mark this as checked
    if (cronTab.id in keysUnchecked) {
      keysChecked.push(cronTab.id);
      keysUnchecked.slice(keysUnchecked.indexOf(cronTab.id), 1);
    }

    // If it doesn't exist, add it
    if (!scheduled[cronTab.id]) {
      if (!cron.valid(cronTab.cron_expression)) {
        console.log(`Invalid cron expression: ${cronTab.cron_expression}`);
        continue;
      }

      const task = {
        cronTab: cron.schedule(cronTab.cron_expression, queueTask(cronTab.id)),
        ...cronTab,
      };
      scheduled[cronTab.id] = task;
    }

    // If it does exist, update it
    else {
      if (scheduled[cronTab.id].cron_expression !== cronTab.cron_expression) {
        scheduled[cronTab.id].cronTab.stop();
        delete scheduled[cronTab.id].cronTab;
        scheduled[cronTab.id].cronTab = cron.schedule(
          cronTab.cron_expression,
          queueTask(cronTab.id)
        );
      }

      scheduled[cronTab.id] = {
        ...scheduled[cronTab.id],
        ...cronTab,
      };
    }
  }

  // Clean up keys that no longer exist
  for (const key of keysUnchecked) {
    if (scheduled[key]) {
      scheduled[key].cronTab.stop();
      delete scheduled[key].cronTab;
      delete scheduled[key];
    }
  }
};

// Keep fresh every 5 minutes
setInterval(run, 5 * 60 * 1000);

run();
