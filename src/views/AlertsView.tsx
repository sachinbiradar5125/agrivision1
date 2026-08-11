import React from 'react';
import { ViewState, AlertItem } from '../types';

interface AlertsViewProps {
  onNavigate: (view: ViewState) => void;
  alerts: AlertItem[];
  onDismissAlert: (id: string) => void;
  onClearAll: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  onNavigate,
  alerts,
  onDismissAlert,
  onClearAll,
}) => {
  const todayAlerts = alerts.filter((a) => a.dateGroup === 'Today');
  const earlierAlerts = alerts.filter((a) => a.dateGroup === 'Earlier');

  return (
    <div className="flex flex-col w-full px-margin-mobile pt-4 pb-32 gap-6 relative max-w-md mx-auto animate-fade-in">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
          Notifications & Alerts
        </h2>
        {alerts.length > 0 && (
          <button
            onClick={onClearAll}
            className="font-label-sm text-primary hover:text-primary-container text-[13px] font-semibold active:scale-95 transition-all"
          >
            Clear All
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center my-8 bg-surface-container rounded-[24px]">
          <span className="material-symbols-outlined text-outline-variant text-[56px] mb-3">
            notifications_off
          </span>
          <h3 className="font-title-md text-on-surface font-semibold text-[18px]">All Caught Up!</h3>
          <p className="font-body-md text-on-surface-variant text-[14px] mt-1">
            No active crop risks or weather warnings at this moment.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Today Group */}
          {todayAlerts.length > 0 && (
            <div>
              <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider block mb-3 font-bold px-1">
                Today
              </span>
              <div className="flex flex-col gap-3">
                {todayAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`relative bg-surface-container-low hover:bg-surface-container rounded-[22px] p-4 shadow-2xs border border-outline-variant/30 flex gap-3.5 items-start overflow-hidden transition-all ${
                      alert.severity === 'critical' ? 'border-l-4 border-l-error' : ''
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs ${
                        alert.type === 'weather'
                          ? 'bg-tertiary-container/30 text-tertiary'
                          : alert.type === 'ai'
                          ? 'bg-secondary-container/30 text-secondary'
                          : 'bg-primary-container/30 text-primary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {alert.type === 'weather'
                          ? 'thunderstorm'
                          : alert.type === 'ai'
                          ? 'smart_toy'
                          : alert.type === 'task'
                          ? 'task_alt'
                          : 'notifications'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-label-sm text-[10px] text-primary font-bold tracking-wider uppercase">
                          {alert.category}
                        </span>
                        <span className="text-[10px] text-outline font-medium">• {alert.time}</span>
                      </div>

                      <h4 className="font-title-md text-on-surface font-semibold text-[15px] leading-tight">
                        {alert.title}
                      </h4>

                      <p className="font-body-md text-on-surface-variant text-[13px] mt-1 leading-snug">
                        {alert.description}
                      </p>

                      {alert.actionable && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => onNavigate('scan')}
                            className="px-3.5 py-1.5 rounded-full bg-primary text-on-primary font-label-sm text-[12px] font-semibold active:scale-95 shadow-xs flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
                            Scan Crop Now
                          </button>
                          <button
                            onClick={() => onNavigate('assistant')}
                            className="px-3.5 py-1.5 rounded-full bg-surface-container text-on-surface font-label-sm text-[12px] font-semibold hover:bg-surface-container-high transition-colors"
                          >
                            Ask AI Advice
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Dismiss X */}
                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-on-surface active:scale-95 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Earlier Group */}
          {earlierAlerts.length > 0 && (
            <div>
              <span className="font-label-sm text-[12px] text-on-surface-variant uppercase tracking-wider block mb-3 font-bold px-1">
                Earlier
              </span>
              <div className="flex flex-col gap-3">
                {earlierAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="relative bg-surface-container-lowest rounded-[22px] p-4 shadow-2xs border border-outline-variant/20 flex gap-3.5 items-start overflow-hidden opacity-90"
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[20px]">
                        {alert.type === 'system' ? 'system_update' : 'inventory_2'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-label-sm text-[10px] text-on-surface-variant font-bold uppercase">
                          {alert.category}
                        </span>
                        <span className="text-[10px] text-outline">• {alert.time}</span>
                      </div>

                      <h4 className="font-title-md text-on-surface font-semibold text-[15px] leading-tight">
                        {alert.title}
                      </h4>

                      <p className="font-body-md text-on-surface-variant text-[13px] mt-1 leading-snug">
                        {alert.description}
                      </p>
                    </div>

                    <button
                      onClick={() => onDismissAlert(alert.id)}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
