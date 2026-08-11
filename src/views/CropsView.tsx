import React, { useState } from 'react';
import { ViewState, Crop, FertilizerTask } from '../types';

interface CropsViewProps {
  crops: Crop[];
  onSelectCrop: (crop: Crop) => void;
  onAddCrop: (crop: Partial<Crop>) => void;
  onDeleteCrop?: (cropId: string) => void;
  tasks?: FertilizerTask[];
}

export const CropsView: React.FC<CropsViewProps> = ({
  crops,
  onSelectCrop,
  onAddCrop,
  onDeleteCrop,
  tasks = [],
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [cropToDelete, setCropToDelete] = useState<Crop | null>(null);
  const [sortOrder, setSortOrder] = useState<'health' | 'name'>('health');
  const [newCropName, setNewCropName] = useState('');
  const [newLocation, setNewLocation] = useState('');

  const sortedCrops = [...crops].sort((a, b) => {
    if (sortOrder === 'health') return b.healthScore - a.healthScore;
    return a.name.localeCompare(b.name);
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName) return;

    onAddCrop({
      name: newCropName,
      location: newLocation || 'Block B',
      healthScore: 90,
      lastScanned: 'Just now',
      status: 'Healthy',
      image:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD9rIr1Yj87MpQWw3pu-rSGVlwidwrc_NqR3CJo-9VFxvQ6ySWe1KECFHmdgirBvyvAyK1hnVixkDLs4KEQlA8IXBULEcorxKFY-xsFFPJMMgmHJYkb64b3Iu34T69BjiahUF2kk09N5SDwvZWIDksbs7eII3BiA7pfYT2JYPJbOGpRuZSSAKsVxVXmrrzVdoX1gGLCAL7PPAA7bnJWG1O7MXeTGqrH1GAD7TYT520aIPwy-CwYlwNt',
    });

    setNewCropName('');
    setNewLocation('');
    setShowAddModal(false);
  };

  return (
    <div className="flex flex-col w-full gap-5 px-margin-mobile pt-4 pb-32 animate-fade-in max-w-md mx-auto">
      {/* Farm Health Summary Dashboard Card */}
      <div className="relative bg-primary overflow-hidden rounded-[2rem] p-6 shadow-md text-on-primary border border-white/10">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-secondary/20 rounded-full blur-xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-4">
          <div>
            <h2 className="font-display-lg text-headline-lg-mobile text-on-primary font-bold">
              Farm Overview
            </h2>
            <p className="font-body-md text-primary-fixed-dim text-sm mt-0.5 opacity-90">
              Valley View Estate
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5 mt-1">
            <div className="bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-primary-fixed text-[20px]">
                  potted_plant
                </span>
                <span className="font-label-sm text-primary-fixed-dim uppercase tracking-wider text-[11px] font-semibold">
                  Total
                </span>
              </div>
              <span className="font-display-lg text-headline-lg text-white font-bold">
                {crops.length + 8}
              </span>
            </div>

            <div className="bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                  monitor_heart
                </span>
                <span className="font-label-sm text-secondary-fixed-dim uppercase tracking-wider text-[11px] font-semibold">
                  Avg Health
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display-lg text-headline-lg text-white font-bold">
                  {Math.round(
                    crops.reduce((acc, c) => acc + c.healthScore, 0) / (crops.length || 1)
                  )}
                </span>
                <span className="font-body-md text-on-primary/70 text-sm font-semibold">%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Crop List Header & Filter */}
      <div className="flex items-center justify-between mt-1">
        <h3 className="font-title-md text-on-background font-bold text-[18px]">Active Crops</h3>
        <button
          onClick={() => setSortOrder(sortOrder === 'health' ? 'name' : 'health')}
          className="flex items-center gap-1.5 text-primary text-sm font-label-sm bg-surface-container hover:bg-surface-container-high py-1.5 px-3.5 rounded-full border border-outline-variant/30 active:scale-95 transition-all shadow-2xs"
        >
          <span className="material-symbols-outlined text-[16px]">filter_list</span>
          Sort by {sortOrder === 'health' ? 'Health' : 'Name'}
        </button>
      </div>

      {/* Crop Cards List */}
      <div className="flex flex-col gap-3.5">
        {sortedCrops.map((crop) => (
          <div
            key={crop.id}
            onClick={() => onSelectCrop(crop)}
            className="bg-surface-container-low hover:bg-surface-container rounded-[22px] shadow-2xs flex flex-col overflow-hidden relative border border-outline-variant/20 cursor-pointer active:scale-[0.99] transition-all"
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                crop.healthScore >= 85
                  ? 'bg-secondary-container'
                  : crop.healthScore >= 70
                  ? 'bg-tertiary-container'
                  : 'bg-error-container'
              }`}
            ></div>

            <div className="flex items-center p-4 gap-4">
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-xs flex-shrink-0 border border-outline-variant/30">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-title-md text-on-surface font-semibold text-[16px] truncate">
                    {crop.name}
                  </h4>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div
                      className={`px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        crop.healthScore >= 85
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-tertiary-container text-on-tertiary'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {crop.healthScore >= 85 ? 'eco' : 'warning'}
                      </span>
                      <span className="font-label-sm text-[12px] font-bold">
                        {crop.healthScore}%
                      </span>
                    </div>

                    {onDeleteCrop && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCropToDelete(crop);
                        }}
                        title="Delete Crop Field"
                        className="w-7 h-7 rounded-full bg-error-container/20 text-error hover:bg-error-container hover:text-on-error-container flex items-center justify-center transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="font-body-md text-sm text-on-surface-variant mb-1 mt-0.5">
                  {crop.location}
                </p>

                <div className="flex items-center justify-between gap-2 mt-auto pt-1">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-outline text-[15px]">
                      schedule
                    </span>
                    <span className="font-label-sm text-outline text-[11px] uppercase font-semibold">
                      {crop.lastScanned}
                    </span>
                  </div>

                  {(() => {
                    const pendingCount = tasks.filter(
                      (t) => (t.cropId === crop.id || t.cropName === crop.name) && !t.completed
                    ).length;
                    if (pendingCount === 0) return null;
                    return (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-[10.5px] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">water_drop</span>
                        {pendingCount} Task{pendingCount > 1 ? 's' : ''}
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Add Crop Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-28 right-margin-mobile w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg shadow-primary/30 flex items-center justify-center transition-all active:scale-90 hover:bg-primary-container z-40"
        aria-label="Add Crop"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      {/* Modal Dialog for Adding Crop */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-[28px] p-6 w-full max-w-sm shadow-2xl border border-outline-variant/40 animate-fade-in">
            <h3 className="font-headline-lg-mobile text-on-surface mb-2 font-bold">Add New Crop</h3>
            <p className="font-body-md text-on-surface-variant text-sm mb-4">
              Enter crop details to start AI health tracking.
            </p>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cherry Tomato, Maize"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full bg-surface-container rounded-xl p-3 text-on-surface outline-none border border-outline-variant/40 focus:border-primary"
                />
              </div>

              <div>
                <label className="font-label-sm text-on-surface-variant block mb-1">Field Location</label>
                <input
                  type="text"
                  placeholder="e.g. Block B, Row 2"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full bg-surface-container rounded-xl p-3 text-on-surface outline-none border border-outline-variant/40 focus:border-primary"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-full bg-surface-container text-on-surface font-title-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-full bg-primary text-on-primary font-title-md shadow-md"
                >
                  Add Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Crop Confirmation Modal */}
      {cropToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface rounded-[28px] p-6 w-full max-w-sm shadow-2xl border border-outline-variant/40 animate-fade-in flex flex-col gap-4">
            <div className="flex items-center gap-3 text-error">
              <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">delete_forever</span>
              </div>
              <h3 className="font-headline-lg-mobile text-on-surface font-bold text-[18px]">Delete Crop Field?</h3>
            </div>

            <p className="font-body-md text-on-surface-variant text-[14px]">
              Are you sure you want to delete <strong className="text-on-surface">{cropToDelete.name}</strong> ({cropToDelete.location})? All associated fertilizer tasks and soil tracking for this field will be permanently removed.
            </p>

            <div className="flex gap-3 mt-1">
              <button
                type="button"
                onClick={() => setCropToDelete(null)}
                className="flex-1 py-3 rounded-full bg-surface-container text-on-surface font-title-md text-[14px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteCrop && cropToDelete) {
                    onDeleteCrop(cropToDelete.id);
                  }
                  setCropToDelete(null);
                }}
                className="flex-1 py-3 rounded-full bg-error text-on-error font-title-md text-[14px] font-bold shadow-md hover:bg-error/90"
              >
                Delete Field
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
