export function isNewUser(): boolean {
  const key = "robinshop-user-since";
  const existing = localStorage.getItem(key);
  if (!existing) {
    localStorage.setItem(key, new Date().toISOString());
    return true;
  }
  const daysSince = (Date.now() - new Date(existing).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince < 3; // Show onboarding for first 3 days only
}

export function markOnboardingComplete() {
  localStorage.setItem("onboarding-completed", "true");
}
