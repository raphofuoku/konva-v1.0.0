/**
 * panels
 * Path: src/features/studio/panels/index.js
 *
 * Tool id → panel component. Each panel receives { st } (the useStudio() object).
 */
import ConvertPanel from './ConvertPanel';
import ResizePanel from './ResizePanel';
import CropPanel from './CropPanel';
import AdjustPanel from './AdjustPanel';
import WatermarkPanel from './WatermarkPanel';
import RedactPanel from './RedactPanel';
import MetadataPanel from './MetadataPanel';
import './Panels.css';

export const PANELS = {
  convert: ConvertPanel,
  resize: ResizePanel,
  crop: CropPanel,
  adjust: AdjustPanel,
  watermark: WatermarkPanel,
  redact: RedactPanel,
  metadata: MetadataPanel,
};