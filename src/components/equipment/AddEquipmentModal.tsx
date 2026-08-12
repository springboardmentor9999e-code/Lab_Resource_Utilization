import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Equipment } from '../../types';
import { X, Cpu, DollarSign, PenTool, Clipboard, Image as ImageIcon, Calendar } from 'lucide-react';

interface AddEquipmentModalProps {
  equipment?: Equipment | null;
  onClose: () => void;
}

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({ equipment, onClose }) => {
  const { currentUser, labs, addEquipment, updateEquipment } = useApp();

  const user = currentUser!;
  // Categories list
  const categoriesList = [
    'Oscilloscopes',
    'Spectrum Analyzers',
    'Signal Generators',
    'Power Supplies',
    'Robotics & Actuators',
    '3D Printing & Fabrication',
    'Compute Servers & Cluster Nodes',
    'Bioreactors & Centrifuges',
    'Spectrophotometers',
    'Other Instruments'
  ];

  // Preset fallback images based on category
  const categoryImages: { [key: string]: string } = {
    'Oscilloscopes': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
    'Spectrum Analyzers': 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=300&auto=format&fit=crop&q=80',
    'Signal Generators': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=80',
    'Power Supplies': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300&auto=format&fit=crop&q=80',
    'Robotics & Actuators': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&auto=format&fit=crop&q=80',
    '3D Printing & Fabrication': 'https://images.unsplash.com/photo-1615840287214-7fe58a8f668f?w=300&auto=format&fit=crop&q=80',
    'Compute Servers & Cluster Nodes': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&auto=format&fit=crop&q=80',
    'Bioreactors & Centrifuges': 'https://images.unsplash.com/photo-1581093588401-f3c22d7a1e0b?w=300&auto=format&fit=crop&q=80',
    'Spectrophotometers': 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=300&auto=format&fit=crop&q=80',
    'Other Instruments': 'https://images.unsplash.com/photo-1532187643603-ba119ca4109e?w=300&auto=format&fit=crop&q=80'
  };

  // Filter labs by HOD/Technician's department, or allow admin to see all labs
  const allowedLabs = user.role === 'admin' 
    ? labs 
    : labs.filter(l => l.departmentId === user.departmentId);

  // Form States
  const [name, setName] = useState(equipment ? equipment.name : '');
  const [modelNumber, setModelNumber] = useState(equipment ? equipment.modelNumber : '');
  const [serialNumber, setSerialNumber] = useState(equipment ? equipment.serialNumber : '');
  const [category, setCategory] = useState(equipment ? equipment.category : categoriesList[0]);
  const [selectedLabId, setSelectedLabId] = useState(equipment ? equipment.labId : (allowedLabs[0]?.id || ''));
  const [purchaseCost, setPurchaseCost] = useState<number>(equipment ? equipment.purchaseCost : 4500);
  const [hourlyRate, setHourlyRate] = useState<number>(equipment ? equipment.hourlyRate : 20);
  const [supervisionRequired, setSupervisionRequired] = useState(equipment ? equipment.requiresTechnicianSupervision : false);
  const [imageUrl, setImageUrl] = useState(equipment ? equipment.imageUrl || '' : '');
  
  // Calibration states
  const [lastCalibrationDate, setLastCalibrationDate] = useState(
    equipment ? equipment.lastCalibrationDate || '' : new Date().toISOString().split('T')[0]
  );
  const [nextCalibrationDueDate, setNextCalibrationDueDate] = useState(
    equipment ? equipment.nextCalibrationDueDate || '' : new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0]
  );
  const [calibrationCertificateNo, setCalibrationCertificateNo] = useState(
    equipment ? equipment.calibrationCertificateNo || '' : `CAL-${Date.now().toString().slice(-6)}`
  );

  // Specifications state formatting
  const getInitialSpecs = () => {
    if (!equipment || !equipment.specifications) return '';
    return Object.entries(equipment.specifications)
      .map(([k, v]) => k === 'Standard specification details' || k === '0' ? v : `${k}: ${v}`)
      .join(', ');
  };
  const [specifications, setSpecifications] = useState(getInitialSpecs());

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string); // base64 string representation
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !modelNumber || !selectedLabId) return;

    const targetLab = labs.find(l => l.id === selectedLabId);
    if (!targetLab) return;

    // Parse specifications string to record
    const specsObj: Record<string, string> = {};
    if (specifications) {
      specifications.split(',').forEach((s, index) => {
        const parts = s.split(':');
        if (parts.length > 1) {
          specsObj[parts[0].trim()] = parts.slice(1).join(':').trim();
        } else {
          specsObj[index.toString()] = s.trim();
        }
      });
    } else {
      specsObj['0'] = 'Standard specification details';
    }

    const payloadImageUrl = imageUrl || categoryImages[category] || categoryImages['Other Instruments'];

    if (equipment) {
      // Modify/Edit existing asset
      updateEquipment(equipment.id, {
        ...equipment,
        name,
        modelNumber,
        serialNumber: serialNumber || equipment.serialNumber,
        category,
        labId: targetLab.id,
        labName: targetLab.name,
        departmentId: targetLab.departmentId,
        departmentName: targetLab.departmentName,
        purchaseCost,
        hourlyRate,
        requiresTechnicianSupervision: supervisionRequired,
        specifications: specsObj,
        imageUrl: payloadImageUrl,
        lastCalibrationDate,
        nextCalibrationDueDate,
        calibrationCertificateNo
      });
    } else {
      // Add new asset
      addEquipment({
        name,
        modelNumber,
        serialNumber: serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
        category,
        labId: targetLab.id,
        labName: targetLab.name,
        departmentId: targetLab.departmentId,
        departmentName: targetLab.departmentName,
        purchaseCost,
        hourlyRate,
        requiresTechnicianSupervision: supervisionRequired,
        specifications: specsObj,
        imageUrl: payloadImageUrl
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">
                {equipment ? 'Modify Lab Equipment' : 'Add New Lab Equipment'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {equipment ? 'Update technical specifications and location info' : 'Register a new physical asset or device into the database'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Device Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Keithley 2450 SourceMeter"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Model Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. K-2450-SMU"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Serial Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. SN-998218-X"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                {categoriesList.map(cat => (
                  <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Lab Location *
              </label>
              <select
                required
                value={selectedLabId}
                onChange={(e) => setSelectedLabId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
              >
                {allowedLabs.map(lab => (
                  <option key={lab.id} value={lab.id} className="bg-slate-900">
                    {lab.code} - {lab.name} ({lab.departmentName.split(' ')[0]})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center mt-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={supervisionRequired}
                  onChange={(e) => setSupervisionRequired(e.target.checked)}
                  className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 w-4 h-4"
                />
                <span className="text-xs text-slate-300">Requires Supervision</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Purchase Cost ($ USD)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Utilization Hourly Rate ($ USD / hr)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Image Upload and URL Input */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Equipment Image (Upload File or URL)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Paste image URL (or select file on right)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <label className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0">
                  <span>Upload File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              {imageUrl && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-2 right-2 bg-slate-950/80 hover:bg-slate-900 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Conditional calibration info in edit mode */}
          {equipment && (
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[10px] uppercase tracking-wider">
                <Calendar className="w-4 h-4 shrink-0" />
                <span>Calibration Metadata Management</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-1">
                    Last Calibrated Date
                  </label>
                  <input
                    type="date"
                    value={lastCalibrationDate}
                    onChange={(e) => setLastCalibrationDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    value={nextCalibrationDueDate}
                    onChange={(e) => setNextCalibrationDueDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-semibold text-slate-400 uppercase mb-1">
                  Calibration Certificate Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. CERT-2026-X"
                  value={calibrationCertificateNo}
                  onChange={(e) => setCalibrationCertificateNo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Specifications (Comma separated parameters)
            </label>
            <textarea
              placeholder="e.g. Bandwidth: 200 MHz, Sample Rate: 2 GS/s, Channels: 4"
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md"
            >
              {equipment ? 'Save Changes' : 'Register Equipment'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
