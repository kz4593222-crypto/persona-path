// Turns the circle the member framed in the photo editor into a square JPEG.
export type CropArea = { x: number; y: number; width: number; height: number };

export const AVATAR_SIZE = 640;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    image.src = src;
  });
}

export async function cropToBlob(src: string, area: CropArea, size = AVATAR_SIZE): Promise<Blob> {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("CANVAS_UNAVAILABLE");
  // Areas zoomed out past the photo edge stay white instead of transparent black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, size, size);
  context.imageSmoothingQuality = "high";
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, size, size);
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("CROP_FAILED")), "image/jpeg", 0.9));
}
