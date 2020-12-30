const detachEventListener = (el: any, evt: any, fn: () => void, opts = false) => el.removeEventListener(evt, fn, opts);
