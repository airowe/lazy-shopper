import * as Notifications from 'expo-notifications';

import { alertsToReArm, evaluateAlerts } from './check';
import { getAlerts, markTriggered } from './storage';

// Checks saved price alerts against current prices and fires a local
// notification for each one that has dropped to/below target (PRD-02).
// Called once on app open. Re-arms alerts whose price rose back above target.
export async function runAlertCheckOnOpen(now: Date = new Date()): Promise<void> {
  const alerts = await getAlerts();
  if (alerts.length === 0) return;

  for (const productId of alertsToReArm(alerts, now)) {
    await markTriggered(productId, false);
  }

  const fresh = await getAlerts();
  const hits = evaluateAlerts(fresh, now);
  if (hits.length === 0) return;

  const granted = await ensureNotificationPermission();

  for (const hit of hits) {
    await markTriggered(hit.productId, true);
    if (granted) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Good news!',
          body: `${hit.productName} dropped to $${hit.price.toFixed(
            2
          )} at ${hit.storeName}.`,
        },
        trigger: null,
      });
    }
  }
}

async function ensureNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}
