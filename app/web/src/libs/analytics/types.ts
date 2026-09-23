export type ScreenName =
  | 'dashboard'
  | 'history'
  | 'history_detail'
  | 'routines'
  | 'routine_create'
  | 'routine_edit'
  | 'workout'
  | 'photo'
  | 'unknown';

export type OperationName =
  | 'preset_create'
  | 'preset_update'
  | 'preset_delete'
  | 'preset_start'
  | 'preset_save'
  | 'workout_start'
  | 'workout_resume'
  | 'workout_pause'
  | 'workout_finish';

export type AnalyticsParamValue = string | number | boolean;

export type AnalyticsParams = Record<string, AnalyticsParamValue>;

export interface AnalyticsPort {
  log(eventName: string, params?: AnalyticsParams): void;
}

export interface OperationParams {
  count?: number;
}
