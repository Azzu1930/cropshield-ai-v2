/**
 * CropShield High-Fidelity Agricultural Specimen Images & Thumbnail Engine
 * Provides fallback crop specimen illustrations and compact thumbnail generator.
 */

// Groundnut / Peanut specimen illustration with pods and soil texture
const GROUNDNUT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bgG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%235c3a21"/>
      <stop offset="60%" stop-color="%233e2311"/>
      <stop offset="100%" stop-color="%23241407"/>
    </linearGradient>
    <radialGradient id="podG" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="%23e8c39e"/>
      <stop offset="60%" stop-color="%23c49a6c"/>
      <stop offset="100%" stop-color="%238a5a2e"/>
    </radialGradient>
    <filter id="tex">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
      <feDiffuseLighting in="noise" lighting-color="%23fff" surfaceScale="2" result="light">
        <feDistantLight azimuth="45" elevation="60"/>
      </feDiffuseLighting>
      <feBlend mode="multiply" in="SourceGraphic" in2="light"/>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(%23bgG)"/>
  <!-- Soil texture pebbles -->
  <circle cx="80" cy="320" r="14" fill="%23472c19" opacity="0.6"/>
  <circle cx="310" cy="350" r="18" fill="%23472c19" opacity="0.5"/>
  <circle cx="160" cy="360" r="10" fill="%232e1b0c" opacity="0.7"/>
  <circle cx="340" cy="90" r="12" fill="%234a301a" opacity="0.4"/>
  <!-- Pod 1 Main Left -->
  <g transform="translate(110, 190) rotate(-28)">
    <path d="M-60,-24 C-35,-42 0,-38 25,-26 C55,-12 85,-28 105,-18 C125,-6 132,18 115,32 C95,48 65,30 35,26 C0,22 -30,42 -55,30 C-75,18 -75,-10 -60,-24 Z" fill="url(%23podG)" stroke="%236e431f" stroke-width="3"/>
    <!-- Shell reticulation mesh lines -->
    <path d="M-50,-5 Q20,-15 95,5 M-45,15 Q25,5 90,20 M-20,-30 Q-5,0 5,28 M30,-22 Q45,2 55,26 M75,-16 Q85,5 95,22" stroke="%237a4b22" stroke-width="2" fill="none" opacity="0.6" stroke-dasharray="3,2"/>
    <!-- Fungal Rot lesion on pod -->
    <ellipse cx="25" cy="2" rx="20" ry="14" fill="%232b1704" opacity="0.85"/>
    <ellipse cx="28" cy="4" rx="14" ry="9" fill="%231a0e02" opacity="0.9"/>
  </g>
  <!-- Pod 2 Cross Right -->
  <g transform="translate(260, 230) rotate(34)">
    <path d="M-55,-22 C-30,-38 5,-35 28,-22 C55,-8 80,-24 100,-15 C118,-4 122,18 108,30 C90,44 60,28 32,24 C0,20 -28,38 -50,28 C-68,16 -68,-10 -55,-22 Z" fill="url(%23podG)" stroke="%236e431f" stroke-width="3"/>
    <path d="M-45,-4 Q20,-12 88,6 M-15,-26 Q-3,0 8,24 M35,-18 Q46,4 56,24" stroke="%237a4b22" stroke-width="2" fill="none" opacity="0.6" stroke-dasharray="3,2"/>
    <ellipse cx="-15" cy="-2" rx="16" ry="10" fill="%233a1e06" opacity="0.8"/>
  </g>
  <!-- Leaves at top -->
  <g transform="translate(190, 95)">
    <path d="M0,45 C-30,30 -60,-5 -30,-45 C-5,-20 0,20 0,45 Z" fill="%2338761d" stroke="%23274e13" stroke-width="2"/>
    <path d="M0,45 C30,30 60,-5 30,-45 C5,-20 0,20 0,45 Z" fill="%23458e24" stroke="%23274e13" stroke-width="2"/>
    <!-- Tikka spot on leaf -->
    <circle cx="-25" cy="-18" r="6" fill="%232b1a07"/>
    <circle cx="-25" cy="-18" r="8" stroke="%23e69138" stroke-width="2" fill="none"/>
    <circle cx="22" cy="-10" r="5" fill="%232b1a07"/>
    <circle cx="22" cy="-10" r="7" stroke="%23e69138" stroke-width="1.8" fill="none"/>
    <!-- Central stem -->
    <path d="M0,45 L0,95" stroke="%235a8234" stroke-width="4" stroke-linecap="round"/>
  </g>
  <text x="200" y="375" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="%23f5e6d3" letter-spacing="1">GROUNDNUT • వేరుశనగ</text>
</svg>`;

// Rice / Paddy specimen illustration with panicles & blast spots
const RICE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bgR" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="%231b4332"/>
      <stop offset="100%" stop-color="%23081c15"/>
    </linearGradient>
    <linearGradient id="goldG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23ffd166"/>
      <stop offset="100%" stop-color="%23d4a373"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(%23bgR)"/>
  <!-- Rice Leaves -->
  <path d="M200,380 C190,260 140,160 40,90 C80,180 160,270 190,380 Z" fill="%232d6a4f" opacity="0.9"/>
  <path d="M210,380 C220,250 270,140 360,80 C320,180 250,280 220,380 Z" fill="%2340916c" opacity="0.9"/>
  <path d="M200,380 Q200,200 195,50 Q205,200 208,380 Z" fill="%2352b788"/>
  <!-- Diamond-shaped Rice Blast Lesions -->
  <g transform="translate(130, 180) rotate(-35)">
    <path d="M0,-16 L10,0 L0,16 L-10,0 Z" fill="%237f4f24" stroke="%239c6644" stroke-width="1.5"/>
    <path d="M0,-8 L5,0 L0,8 L-5,0 Z" fill="%23ede0d4"/>
  </g>
  <g transform="translate(260, 190) rotate(35)">
    <path d="M0,-14 L9,0 L0,14 L-9,0 Z" fill="%237f4f24" stroke="%239c6644" stroke-width="1.5"/>
    <path d="M0,-7 L4,0 L0,7 L-4,0 Z" fill="%23ede0d4"/>
  </g>
  <!-- Grains on Panicle -->
  <g fill="url(%23goldG)" stroke="%23b08968" stroke-width="1">
    <ellipse cx="195" cy="70" rx="6" ry="12" transform="rotate(-25 195 70)"/>
    <ellipse cx="205" cy="85" rx="6" ry="12" transform="rotate(25 205 85)"/>
    <ellipse cx="192" cy="100" rx="6" ry="12" transform="rotate(-20 192 100)"/>
    <ellipse cx="210" cy="115" rx="6" ry="12" transform="rotate(30 210 115)"/>
    <ellipse cx="190" cy="130" rx="6" ry="12" transform="rotate(-28 190 130)"/>
    <ellipse cx="212" cy="145" rx="6" ry="12" transform="rotate(22 212 145)"/>
  </g>
  <text x="200" y="375" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="%23d8f3dc" letter-spacing="1">RICE • వరి పంట</text>
</svg>`;

// Tomato specimen illustration with fruit & leaf blight
const TOMATO_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <radialGradient id="tomG" cx="35%" cy="30%" r="70%">
      <stop offset="0%" stop-color="%23ff6b6b"/>
      <stop offset="65%" stop-color="%23e03131"/>
      <stop offset="100%" stop-color="%239b111e"/>
    </radialGradient>
    <linearGradient id="bgT" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%231e3d2f"/>
      <stop offset="100%" stop-color="%230b1712"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(%23bgT)"/>
  <!-- Foliage -->
  <g fill="%232f6f44" stroke="%231a472a" stroke-width="2">
    <path d="M120,160 Q80,110 50,130 Q70,170 120,160 Z"/>
    <path d="M280,150 Q320,100 350,120 Q330,160 280,150 Z"/>
    <!-- Early Blight Concentric Rings on Leaf -->
    <circle cx="80" cy="140" r="14" fill="%234a2e18"/>
    <circle cx="80" cy="140" r="10" stroke="%23ffd166" stroke-width="1.5" fill="none"/>
    <circle cx="80" cy="140" r="5" fill="%23221208"/>
  </g>
  <!-- Tomato Fruit -->
  <circle cx="200" cy="225" r="85" fill="url(%23tomG)" stroke="%237a0c16" stroke-width="3"/>
  <ellipse cx="170" cy="185" rx="20" ry="12" fill="%23ff8787" opacity="0.6" transform="rotate(-30 170 185)"/>
  <!-- Calyx -->
  <g fill="%2338b000" stroke="%23206a00" stroke-width="2">
    <path d="M200,140 L195,115 L200,125 L205,115 Z"/>
    <path d="M200,140 L170,125 L185,135 Z"/>
    <path d="M200,140 L230,125 L215,135 Z"/>
    <path d="M200,140 L165,150 L185,145 Z"/>
    <path d="M200,140 L235,150 L215,145 Z"/>
    <circle cx="200" cy="140" r="8"/>
  </g>
  <text x="200" y="375" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="%23ffe3e3" letter-spacing="1">TOMATO • టమోటా</text>
</svg>`;

// Chilli specimen illustration
const CHILLI_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bgC" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%231a3323"/>
      <stop offset="100%" stop-color="%230b1710"/>
    </linearGradient>
    <linearGradient id="chG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%2338b000"/>
      <stop offset="50%" stop-color="%23d00000"/>
      <stop offset="100%" stop-color="%237a0000"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(%23bgC)"/>
  <!-- Curled Chilli Leaf -->
  <path d="M120,110 C80,70 120,40 180,75 C150,90 140,115 120,110 Z" fill="%2343aa8b" stroke="%23277a60" stroke-width="2"/>
  <!-- Chilli Pod -->
  <path d="M200,120 C220,140 240,210 200,290 C180,260 170,200 190,130 Z" fill="url(%23chG)" stroke="%23540b0e" stroke-width="2.5"/>
  <!-- Stem -->
  <path d="M200,120 C205,95 220,90 225,85" stroke="%2338b000" stroke-width="5" stroke-linecap="round" fill="none"/>
  <ellipse cx="200" cy="120" rx="9" ry="5" fill="%232b9348"/>
  <text x="200" y="375" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="%23d8f3dc" letter-spacing="1">CHILLI • మిర్చి</text>
</svg>`;

// Cotton specimen illustration
const COTTON_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bgCot" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%231e3328"/>
      <stop offset="100%" stop-color="%230e1c15"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(%23bgCot)"/>
  <!-- Bracts (Sepals) -->
  <g fill="%23604a29" stroke="%233e2c14" stroke-width="2">
    <path d="M200,240 L160,260 L180,225 Z"/>
    <path d="M200,240 L240,260 L220,225 Z"/>
    <path d="M200,240 L200,280 Z"/>
  </g>
  <!-- Cotton White Fluff Bolls -->
  <g fill="%23f8f9fa" stroke="%23dee2e6" stroke-width="2">
    <circle cx="170" cy="190" r="32"/>
    <circle cx="230" cy="190" r="32"/>
    <circle cx="200" cy="160" r="34"/>
    <circle cx="200" cy="205" r="30"/>
  </g>
  <!-- Stem -->
  <path d="M200,240 L200,340" stroke="%23583a1b" stroke-width="6" stroke-linecap="round"/>
  <text x="200" y="375" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="%23e9ecef" letter-spacing="1">COTTON • పత్తి</text>
</svg>`;

// Maize specimen illustration
const MAIZE_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bgM" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23193424"/>
      <stop offset="100%" stop-color="%230c1e13"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(%23bgM)"/>
  <!-- Cob Husk -->
  <path d="M160,300 C150,180 180,110 200,90 C220,110 250,180 240,300 Z" fill="%23ffb703" stroke="%23fb8500" stroke-width="2"/>
  <!-- Kernels grid -->
  <g fill="%23ffd166" opacity="0.9">
    <circle cx="185" cy="140" r="6"/><circle cx="200" cy="140" r="6"/><circle cx="215" cy="140" r="6"/>
    <circle cx="185" cy="160" r="6"/><circle cx="200" cy="160" r="6"/><circle cx="215" cy="160" r="6"/>
    <circle cx="185" cy="180" r="6"/><circle cx="200" cy="180" r="6"/><circle cx="215" cy="180" r="6"/>
    <circle cx="185" cy="200" r="6"/><circle cx="200" cy="200" r="6"/><circle cx="215" cy="200" r="6"/>
    <circle cx="185" cy="220" r="6"/><circle cx="200" cy="220" r="6"/><circle cx="215" cy="220" r="6"/>
    <circle cx="185" cy="240" r="6"/><circle cx="200" cy="240" r="6"/><circle cx="215" cy="240" r="6"/>
  </g>
  <!-- Husk Leaves -->
  <path d="M160,300 C140,220 130,160 110,130 C135,170 155,240 160,300 Z" fill="%23588157"/>
  <path d="M240,300 C260,220 270,160 290,130 C265,170 245,240 240,300 Z" fill="%233a5a40"/>
  <text x="200" y="375" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="%23ffe8d6" letter-spacing="1">MAIZE • మొక్కజొన్న</text>
</svg>`;

// General Agricultural Crop / Plant specimen illustration
const GENERAL_CROP_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bgGen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%231b4332"/>
      <stop offset="100%" stop-color="%23081c15"/>
    </linearGradient>
  </defs>
  <rect width="400" height="400" fill="url(%23bgGen)"/>
  <!-- Stem -->
  <path d="M200,360 Q200,220 195,120" stroke="%2340916c" stroke-width="8" stroke-linecap="round" fill="none"/>
  <!-- Left Leaf -->
  <path d="M196,240 C140,230 100,170 80,120 C130,130 170,180 196,240 Z" fill="%2352b788" stroke="%232d6a4f" stroke-width="2.5"/>
  <!-- Right Leaf -->
  <path d="M198,180 C260,170 300,120 320,70 C270,80 230,130 198,180 Z" fill="%2374c69d" stroke="%2340916c" stroke-width="2.5"/>
  <!-- Top Bud -->
  <ellipse cx="195" cy="115" rx="14" ry="22" fill="%2395d5b2" stroke="%2352b788" stroke-width="2"/>
  <text x="200" y="375" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="%23d8f3dc" letter-spacing="1">HEALTHY CROP • పైరు</text>
</svg>`;

/**
 * Returns a high-fidelity crop specimen image data URI for the given crop name and issue.
 */
export function getFallbackCropImage(cropName?: string | null, possibleIssue?: string | null): string {
  const norm = `${cropName || ''} ${possibleIssue || ''}`.toLowerCase();

  if (norm.includes('groundnut') || norm.includes('peanut') || norm.includes('వేరుశనగ') || norm.includes('मूंगफली') || norm.includes('pod rot') || norm.includes('tikka')) {
    return GROUNDNUT_SVG;
  }
  if (norm.includes('rice') || norm.includes('paddy') || norm.includes('వరి') || norm.includes('धान') || norm.includes('blast') || norm.includes('brown spot')) {
    return RICE_SVG;
  }
  if (norm.includes('tomato') || norm.includes('టమోటా') || norm.includes('टमाटर') || norm.includes('blight')) {
    return TOMATO_SVG;
  }
  if (norm.includes('chilli') || norm.includes('chili') || norm.includes('pepper') || norm.includes('మిర్చి') || norm.includes('मिर्च')) {
    return CHILLI_SVG;
  }
  if (norm.includes('cotton') || norm.includes('పత్తి') || norm.includes('कपास')) {
    return COTTON_SVG;
  }
  if (norm.includes('maize') || norm.includes('corn') || norm.includes('మొక్కజొన్న') || norm.includes('मक्का')) {
    return MAIZE_SVG;
  }

  return GENERAL_CROP_SVG;
}

/**
 * Ensures an image source is always available. If the provided photoPreview is missing,
 * empty, or invalid, returns the authentic specimen image for that crop.
 */
export function getCropImage(
  cropName?: string | null,
  possibleIssue?: string | null,
  photoPreview?: string | null
): string {
  if (photoPreview && typeof photoPreview === 'string' && photoPreview.trim().length > 10) {
    return photoPreview.trim();
  }
  return getFallbackCropImage(cropName, possibleIssue);
}

/**
 * Generates an ultra-compact, high quality JPEG thumbnail (~4-8KB) suitable for
 * saving safely in localStorage quotas and Supabase image_url columns.
 */
export async function generateThumbnail(
  dataUrl: string,
  maxDimension = 200,
  quality = 0.72
): Promise<string> {
  if (typeof window === 'undefined' || !dataUrl.startsWith('data:image')) {
    return dataUrl;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, width, height);

        const thumb = canvas.toDataURL('image/jpeg', quality);
        resolve(thumb || dataUrl);
      } catch {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
