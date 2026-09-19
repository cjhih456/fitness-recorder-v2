/**
 * Renders the share card DOM node to a PNG download via canvas.
 * Uses foreignObject SVG → Image → canvas (no extra deps).
 */
export async function downloadShareCard(
  element: HTMLElement,
  fileName = 'fitlog-photo.png',
): Promise<void> {
  const width = element.offsetWidth || 358;
  const height = element.offsetHeight || 450;
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.margin = '0';
  clone.style.position = 'static';

  const serializer = new XMLSerializer();
  const xhtml = serializer.serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <foreignObject width="100%" height="100%">
      <div xmlns="http://www.w3.org/1999/xhtml">${xhtml}</div>
    </foreignObject>
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    ctx.scale(2, 2);
    ctx.drawImage(image, 0, 0, width, height);

    const pngUrl = canvas.toDataURL('image/png');
    const anchor = document.createElement('a');
    anchor.href = pngUrl;
    anchor.download = fileName;
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to render share card'));
    image.src = src;
  });
}
