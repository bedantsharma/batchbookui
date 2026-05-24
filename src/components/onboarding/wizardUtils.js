// src/components/onboarding/wizardUtils.js
export const randomHandle = () =>
  'guest_' + Math.random().toString(36).slice(2, 7);

export const randomInstitute = () =>
  'institute_' + Math.floor(1000 + Math.random() * 9000);
