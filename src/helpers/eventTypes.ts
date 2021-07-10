interface Events {
  /**
   * Ready event.
   * @event
   */
  ready: () => void;
  /**
   * Error event.
   * @event
   */
  error: (error: Error) => void;
}

export default Events;
