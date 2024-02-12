import { SETTINGS } from '../interfaces';

export const updateSettings = (newSettings: SETTINGS) => {
  localStorage.setItem('settings', JSON.stringify(newSettings));
};

export const loadSettings = (): SETTINGS | {} => {
  const settings = localStorage.getItem('settings');
  if (settings) {
    return JSON.parse(settings);
  } else {
    return {};
  }
};
