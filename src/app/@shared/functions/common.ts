import { Subscription } from 'rxjs';

export const detachEventListener = (el: any, evt: any, fn: () => void, opts = false) =>
  el.removeEventListener(evt, fn, opts);

export const unsubscribe = (subscriptions: Subscription[]): void => {
  if (subscriptions?.length === 0) {
    return;
  }

  subscriptions.forEach((sub) => sub?.unsubscribe());
};
