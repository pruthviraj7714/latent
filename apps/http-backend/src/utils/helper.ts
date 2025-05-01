export function addMinPriceToEvent(event: any) {
    if (!event) return null;
    
    const minPrice = event.seats?.length
      ? Math.min(...event.seats.map((seat: any) => seat.price))
      : null;
    
    return {
      ...event,
      minPrice,
    };
  }
  
  export function addMinPriceToEvents(events: any[]) {
    if (!events?.length) return [];
    
    return events.map(event => {
      if (!event.seats) return event;
      
      return addMinPriceToEvent(event);
    });
  }