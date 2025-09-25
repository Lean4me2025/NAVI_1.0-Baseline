// Shared helpers for navigation and state
const App = {
  // Resets any persisted state for a fresh start unless we're moving forward
  reset() {
    localStorage.removeItem('nova_traits');
    localStorage.removeItem('reflection_status');
    localStorage.removeItem('selected_plan');
  },
  setTraits(traits) { localStorage.setItem('nova_traits', JSON.stringify(traits || [])); },
  getTraits() { return JSON.parse(localStorage.getItem('nova_traits') || '[]'); },
  setReflection(val) { localStorage.setItem('reflection_status', val || ''); },
  getReflection() { return localStorage.getItem('reflection_status') || ''; },
  setPlan(val) { localStorage.setItem('selected_plan', val || ''); },
  getPlan() { return localStorage.getItem('selected_plan') || ''; },
  go(url) { window.location.href = url; }
};
