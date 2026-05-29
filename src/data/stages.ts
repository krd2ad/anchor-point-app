import type { Stage } from '../types';

export const STAGES: Stage[] = [
  { id: 'stage-1', order: 1, name: 'New Intake',            color: '#579dff' },
  { id: 'stage-2', order: 2, name: 'Active Processing',     color: '#9f8fef' },
  { id: 'stage-3', order: 3, name: 'Title & Closing',       color: '#f5cd47' },
  { id: 'stage-4', order: 4, name: 'Servicing Setup',       color: '#4bce97' },
  { id: 'stage-5', order: 5, name: 'Collecting',            color: '#6cc3e0' },
  { id: 'stage-6', order: 6, name: 'Special Servicing',     color: '#f87168' },
  { id: 'stage-7', order: 7, name: 'Foreclosure',           color: '#e2483d' },
  { id: 'stage-8', order: 8, name: 'Completed / Paid Off',  color: '#4bce97' },
];
