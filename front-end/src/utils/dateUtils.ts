export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    let date: Date;
    
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string') {
      // Try parsing as ISO string first
      date = new Date(dateString);
      
      if (isNaN(date.getTime())) {
        // Try parsing as timestamp
        const timestamp = parseInt(dateString);
        if (!isNaN(timestamp)) {
          date = new Date(timestamp);
        } else {
          // Try parsing as different date formats
          const parsed = Date.parse(dateString);
          if (!isNaN(parsed)) {
            date = new Date(parsed);
          } else {
            return 'Invalid Date';
          }
        }
      }
    } else {
      return 'Invalid Date';
    }
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid Date';
  }
}; 