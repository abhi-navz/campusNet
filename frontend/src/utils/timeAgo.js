/**
 * @function timeAgo
 * @desc Converts a date string into a relative time string (e.g., "5 minutes ago").
 * @param {string | Date} date - The date to measure the difference from (ISO string or Date object).
 * @returns {string} The formatted relative time string.
 */
export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval + (interval === 1 ? " year ago" : " years ago");
    }
  
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval + (interval === 1 ? " month ago" : " months ago");
    }
  
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + (interval === 1 ? " day ago" : " days ago");
    }
  
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + (interval === 1 ? " hour ago" : " hours ago");
    }
  
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + (interval === 1 ? " minute ago" : " minutes ago");
    }
    
    return "just now";
  };