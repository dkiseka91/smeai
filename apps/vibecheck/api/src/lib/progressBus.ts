import { EventEmitter } from 'events';
import type { ProgressEvent } from './types';

const buses = new Map<string, EventEmitter>();
/** Replay buffer so a client connecting mid-run (or after refresh) still sees prior events. */
const history = new Map<string, ProgressEvent[]>();

function getBus(runId: string): EventEmitter {
  let bus = buses.get(runId);
  if (!bus) {
    bus = new EventEmitter();
    bus.setMaxListeners(50);
    buses.set(runId, bus);
    history.set(runId, []);
  }
  return bus;
}

export function emitProgress(runId: string, event: ProgressEvent): void {
  const bus = getBus(runId);
  history.get(runId)?.push(event);
  bus.emit('event', event);
  if (event.type === 'run:complete' || event.type === 'run:error') {
    // Give in-flight SSE listeners a moment to receive the terminal event, then clean up.
    setTimeout(() => {
      buses.delete(runId);
      history.delete(runId);
    }, 60_000);
  }
}

export function subscribeProgress(runId: string, onEvent: (event: ProgressEvent) => void): () => void {
  const bus = getBus(runId);
  bus.on('event', onEvent);
  return () => bus.off('event', onEvent);
}

export function getHistory(runId: string): ProgressEvent[] {
  return history.get(runId) ?? [];
}
