interface Events {
  ready: () => void;
  error: (error: Error) => void;
}

export default Events;
