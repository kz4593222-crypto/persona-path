import { useState } from "react";
import Cropper from "react-easy-crop";
import { Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cropToBlob, type CropArea } from "@/lib/crop-image";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

/** Circle photo editor: drag to position, zoom to fill, Save uploads exactly what is inside the circle. */
export function AvatarCropDialog({ src, onCancel, onSave }: { src: string | null; onCancel: () => void; onSave: (blob: Blob) => Promise<void> }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [area, setArea] = useState<CropArea | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => { setCrop({ x: 0, y: 0 }); setZoom(1); setArea(null); setError(""); };
  const close = () => { if (saving) return; reset(); onCancel(); };
  const save = async () => {
    if (!src || !area) return;
    setSaving(true);
    setError("");
    try {
      await onSave(await cropToBlob(src, area));
      reset();
    } catch {
      setError("Your photo was not saved. Try again.");
    } finally {
      setSaving(false);
    }
  };
  const step = (delta: number) => setZoom(value => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round((value + delta) * 10) / 10)));

  return <Dialog open={!!src} onOpenChange={open => { if (!open) close(); }}>
    <DialogContent className="crop-dialog">
      <DialogTitle className="crop-title">Adjust your photo</DialogTitle>
      <DialogDescription className="crop-hint">Drag to move. Zoom to fill the circle — your profile shows exactly what's inside it.</DialogDescription>
      <div className="crop-stage">
        {src && <Cropper image={src} crop={crop} zoom={zoom} minZoom={MIN_ZOOM} maxZoom={MAX_ZOOM} aspect={1} cropShape="round" showGrid={false} objectFit="cover"
          onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setArea(pixels)} />}
      </div>
      <div className="crop-zoom">
        <button type="button" onClick={() => step(-0.2)} aria-label="Zoom out"><ZoomOut aria-hidden="true" /></button>
        <Slider value={[zoom]} min={MIN_ZOOM} max={MAX_ZOOM} step={0.01} onValueChange={([value]) => setZoom(value ?? MIN_ZOOM)} aria-label="Zoom" className="crop-slider" />
        <button type="button" onClick={() => step(0.2)} aria-label="Zoom in"><ZoomIn aria-hidden="true" /></button>
      </div>
      {error && <p className="crop-error" role="alert">{error}</p>}
      <div className="crop-actions">
        <Button type="button" variant="ghost" onClick={close} disabled={saving}>Cancel</Button>
        <Button type="button" className="crop-save" onClick={() => void save()} disabled={!area || saving}>{saving && <Loader2 className="plan-loading-spin" />}Save</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
