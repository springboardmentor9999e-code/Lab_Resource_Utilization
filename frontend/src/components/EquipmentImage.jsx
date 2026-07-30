import { useState } from 'react';

// Equipment Dedicated SVG Assets
import printer3dImg from '../assets/images/equipment/3d-printer.svg';
import cncImg from '../assets/images/equipment/cnc-machine.svg';
import oscilloscopeImg from '../assets/images/equipment/oscilloscope.svg';
import signalGenImg from '../assets/images/equipment/signal-generator.svg';
import spectrumImg from '../assets/images/equipment/spectrum-analyzer.svg';
import pcrImg from '../assets/images/equipment/pcr-machine.svg';
import microscopeImg from '../assets/images/equipment/microscope.svg';
import gpuImg from '../assets/images/equipment/gpu-workstation.svg';
import hpcServerImg from '../assets/images/equipment/hpc-server.svg';
import roboticsImg from '../assets/images/equipment/robotics-kit.svg';
import utmImg from '../assets/images/equipment/utm-machine.svg';
import multimeterImg from '../assets/images/equipment/digital-multimeter.svg';
import fpgaImg from '../assets/images/equipment/fpga-board.svg';
import networkAnalyzerImg from '../assets/images/equipment/network-analyzer.svg';

// Category Fallback SVG Assets
import categoryComputingImg from '../assets/images/equipment/category-computing.svg';
import categoryOpticsImg from '../assets/images/equipment/category-optics.svg';
import categoryElectronicsImg from '../assets/images/equipment/category-electronics.svg';
import categoryManufacturingImg from '../assets/images/equipment/category-manufacturing.svg';
import categoryBiotechImg from '../assets/images/equipment/category-biotech.svg';
import categoryMaterialsImg from '../assets/images/equipment/category-materials.svg';
import categoryDefaultImg from '../assets/images/equipment/category-default.svg';

/**
 * Resolves dedicated high-quality image asset for any laboratory equipment
 */
export function getEquipmentImageAsset(equipment = {}) {
  const name = (equipment?.name || equipment?.equipmentName || '').toLowerCase();
  const model = (equipment?.model || equipment?.equipmentModel || '').toLowerCase();
  const mfr = (equipment?.manufacturer || '').toLowerCase();
  const cat = (equipment?.categoryName || equipment?.category || '').toLowerCase();

  const searchStr = `${name} ${model} ${mfr} ${cat}`;

  // 1. 3D Printer
  if (searchStr.includes('3d printer') || searchStr.includes('ultimaker') || searchStr.includes('prototyping system')) {
    return printer3dImg;
  }
  // 2. CNC Machine
  if (searchStr.includes('cnc') || searchStr.includes('milling') || searchStr.includes('haas')) {
    return cncImg;
  }
  // 3. Oscilloscope
  if (searchStr.includes('oscilloscope') || searchStr.includes('tektronix') || searchStr.includes('storage oscilloscope')) {
    return oscilloscopeImg;
  }
  // 4. Signal Generator
  if (searchStr.includes('signal generator') || searchStr.includes('n5182b') || searchStr.includes('rf vector signal')) {
    return signalGenImg;
  }
  // 5. Spectrum Analyzer
  if (searchStr.includes('spectrum analyzer') || searchStr.includes('ms2830a') || strokeMatch(searchStr, ['spectrum', 'signal analyzer'])) {
    return spectrumImg;
  }
  // 6. PCR Machine
  if (searchStr.includes('pcr') || searchStr.includes('quantstudio') || searchStr.includes('thermal cycler') || searchStr.includes('applied biosystems')) {
    return pcrImg;
  }
  // 7. Microscope / FESEM
  if (searchStr.includes('microscope') || searchStr.includes('fesem') || searchStr.includes('scanning electron') || searchStr.includes('zeiss')) {
    return microscopeImg;
  }
  // 8. GPU Workstation
  if (searchStr.includes('gpu') || searchStr.includes('a100') || searchStr.includes('h100') || searchStr.includes('supermicro') || searchStr.includes('ai workstation')) {
    return gpuImg;
  }
  // 9. HPC Server
  if (searchStr.includes('hpc') || searchStr.includes('server') || searchStr.includes('poweredge') || searchStr.includes('xeon')) {
    return hpcServerImg;
  }
  // 10. Universal Testing Machine / Tensile
  if (searchStr.includes('universal testing') || searchStr.includes('utm') || searchStr.includes('instron') || searchStr.includes('tensile')) {
    return utmImg;
  }
  // 11. FPGA Development Board
  if (searchStr.includes('fpga') || searchStr.includes('zynq') || searchStr.includes('xilinx') || searchStr.includes('zcu102')) {
    return fpgaImg;
  }
  // 12. Digital Multimeter
  if (searchStr.includes('multimeter') || searchStr.includes('34465a') || searchStr.includes('truevolt') || searchStr.includes('digit multimeter')) {
    return multimeterImg;
  }
  // 13. Network Analyzer
  if (searchStr.includes('network analyzer') || searchStr.includes('e5080b') || searchStr.includes('ena') || searchStr.includes('vna')) {
    return networkAnalyzerImg;
  }
  // 14. Robotics Kit
  if (searchStr.includes('robotics') || searchStr.includes('mechatronics') || searchStr.includes('quanser') || searchStr.includes('qnet')) {
    return roboticsImg;
  }

  // Category Level Fallbacks
  if (cat.includes('computing') || cat.includes('ai')) return categoryComputingImg;
  if (cat.includes('optics') || cat.includes('imaging')) return categoryOpticsImg;
  if (cat.includes('electronics') || cat.includes('rf')) return categoryElectronicsImg;
  if (cat.includes('manufacturing') || cat.includes('3d')) return categoryManufacturingImg;
  if (cat.includes('bio') || cat.includes('life')) return categoryBiotechImg;
  if (cat.includes('material') || cat.includes('testing')) return categoryMaterialsImg;

  return categoryDefaultImg;
}

function strokeMatch(str, words) {
  return words.every(w => str.includes(w));
}

/**
 * Reusable Equipment Image Component
 */
export default function EquipmentImage({ equipment = {}, className = 'w-full h-full object-cover', alt }) {
  const resolvedAsset = getEquipmentImageAsset(equipment);
  
  // Check if original imageUrl exists and is NOT a generic unsplash link
  const originalUrl = equipment?.imageUrl;
  const isGenericUnsplash = originalUrl && originalUrl.includes('images.unsplash.com');
  const initialSrc = (!originalUrl || isGenericUnsplash) ? resolvedAsset : originalUrl;

  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(resolvedAsset);
    }
  };

  const imageAlt = alt || equipment?.name || equipment?.equipmentName || 'Laboratory Equipment';

  return (
    <img
      src={imgSrc}
      alt={imageAlt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  );
}
