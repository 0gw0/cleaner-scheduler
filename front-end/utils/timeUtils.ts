interface Shift {
    startTime: string; 
    endTime: string;   
    date: string;
  }
  
  const predefinedShifts: Shift[] = [
    { startTime: '12:00:00', endTime: '13:00:00', date:'2021-03-25' }, // Lunch Break
    { startTime: '17:00:00', endTime: '18:00:00', date:'2021-03-25' }, // Dinner Break
  ];

  function isTimeValid(startTime: string, endTime: string): boolean {
    return startTime < endTime;
  }
  
  function doesOverlapWithPredefinedShifts(startTime: string, endTime: string): boolean {
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
  
    return predefinedShifts.some((shift) => {
      const shiftStart = new Date(`1970-01-01T${shift.startTime}`);
      const shiftEnd = new Date(`1970-01-01T${shift.endTime}`);
      
      return (start < shiftEnd && end > shiftStart);
    });
  }


  function isToday3HoursLater(date: string, startTime: string): boolean {
    const now = new Date();
    const threeHoursLater = new Date(now.getTime() + 3 * 60 * 60 * 1000); 
    const selectedDateTime = new Date(`${date}T${startTime}`);
  
    return selectedDateTime >= threeHoursLater;
  }

  
  function validateShift(startTime: string, endTime: string, date: string): string | null {
    if (!isTimeValid(startTime, endTime)) {
      return 'Start time must be earlier than end time.';
    }
    
    if (doesOverlapWithPredefinedShifts(startTime, endTime)) {
      return `The shift overlaps with the worker's lunch/dinner break.`;
    }

    if (!isToday3HoursLater(date, startTime)){
        return 'The start time must be at least 3 hours from now.'
    }

    
    return null; 
  }

  export { validateShift, isTimeValid, doesOverlapWithPredefinedShifts };
  