// Authentication utilities
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

export const isAdmin = () => {
  if (!isAuthenticated()) return false;

  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.role === 'admin';
  } catch (error) {
    return false;
  }
};

export const getCurrentUser = () => {
  if (!isAuthenticated()) return null;

  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (error) {
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Redirect to home page
  window.location.href = '/';
};
