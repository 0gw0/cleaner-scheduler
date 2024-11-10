interface Shift {
    startTime: string; 
    endTime: string;   
    date: string;
  }
  
  const predefinedShifts: Shift[] = [
    { startTime: '12:00:00', endTime: '13:00:00', date:'2021-03-25' }, // Lunch Break
    { startTime: '17:00:00', endTime: '18:00:00', date:'2021-03-25' }, // Dinner Break
  ];

  const workingHours: Shift[] = [
    { startTime: '08:00:00', endTime: '12:00:00', date:'2021-03-25' }, 
    { startTime: '13:00:00', endTime: '17:00:00', date:'2021-03-25' }, 
    { startTime: '18:00:00', endTime: '22:00:00', date:'2021-03-25' }, 
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

  function withinWorkingHours(startTime: string, endTime: string): boolean {
    const [startHour, startMinute, startSecond] = startTime.split(':').map(Number);
    const [endHour, endMinute, endSecond] = endTime.split(':').map(Number);
    const start = new Date();
    const end = new Date();
    start.setHours(startHour, startMinute, startSecond || 0);
    end.setHours(endHour, endMinute, endSecond || 0);
  
    for (const shift of workingHours) {
      const [shiftStartHour, shiftStartMinute, shiftStartSecond] = shift.startTime.split(':').map(Number);
      const [shiftEndHour, shiftEndMinute, shiftEndSecond] = shift.endTime.split(':').map(Number);
      const shiftStart = new Date();
      const shiftEnd = new Date();
      shiftStart.setHours(shiftStartHour, shiftStartMinute, shiftStartSecond || 0);
      shiftEnd.setHours(shiftEndHour, shiftEndMinute, shiftEndSecond || 0);
  
      if (start >= shiftStart && end <= shiftEnd) {
        return true;
      }
    }
  
    return false;
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

    if (!withinWorkingHours(startTime, endTime)){
        return 'Not within working hours!'
    }
    
    return null; 
  }

  export { validateShift, isTimeValid, doesOverlapWithPredefinedShifts };
  