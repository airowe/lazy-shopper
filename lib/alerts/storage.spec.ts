import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getAlert,
  getAlerts,
  markTriggered,
  removeAlert,
  setAlert,
} from './storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const REAL = 'lego-21261-wolf-stronghold';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('alerts storage', () => {
  it('starts empty', async () => {
    expect(await getAlerts()).toEqual([]);
  });

  it('sets an alert', async () => {
    await setAlert(REAL, 50);
    const alert = await getAlert(REAL);
    expect(alert?.targetPrice).toBe(50);
    expect(alert?.triggered).toBe(false);
  });

  it('replaces an existing alert on re-set', async () => {
    await setAlert(REAL, 50);
    await setAlert(REAL, 45);
    const alerts = await getAlerts();
    expect(alerts).toHaveLength(1);
    expect(alerts[0].targetPrice).toBe(45);
  });

  it('re-setting re-arms a triggered alert', async () => {
    await setAlert(REAL, 50);
    await markTriggered(REAL, true);
    await setAlert(REAL, 45);
    expect((await getAlert(REAL))?.triggered).toBe(false);
  });

  it('removes an alert', async () => {
    await setAlert(REAL, 50);
    await removeAlert(REAL);
    expect(await getAlert(REAL)).toBeUndefined();
  });

  it('marks an alert triggered', async () => {
    await setAlert(REAL, 50);
    await markTriggered(REAL, true);
    expect((await getAlert(REAL))?.triggered).toBe(true);
  });

  it('prunes alerts for products no longer in the catalog', async () => {
    await AsyncStorage.setItem(
      'lazy-shopper.alerts.v1',
      JSON.stringify([
        { productId: 'ghost', targetPrice: 1, createdAt: 'x', triggered: false },
        { productId: REAL, targetPrice: 2, createdAt: 'x', triggered: false },
      ])
    );
    const alerts = await getAlerts();
    expect(alerts.map((a) => a.productId)).toEqual([REAL]);
  });
});
