// Accurate multi-crop image validator
// Validates leaves, foliage, pods, seeds, grains, fruits, vegetables, stems, roots, tubers, and disease lesions
// Rejects selfies, humans, portraits, documents, vehicles, screens, and random non-agricultural images

export interface ImageValidationResult {
  isValid: boolean;
  reason?: 'human_or_selfie' | 'too_blurry' | 'not_plant' | 'too_small' | 'corrupt';
  message: string;
  plantRatio?: number;
  skinRatio?: number;
}

/**
 * Validates whether an image contains a genuine agricultural crop, leaf, pod, grain, fruit, or farm plant.
 * Covers leaves, groundnut pods, cotton bolls, tubers, cereals, vegetables, and disease symptoms.
 */
export function validateImageClient(
  source: HTMLCanvasElement | HTMLImageElement,
  cropHint?: string
): ImageValidationResult {
  const width = source.width;
  const height = source.height;

  if (width < 60 || height < 60) {
    return {
      isValid: false,
      reason: 'too_small',
      message: 'Photo is too small. Please take a closer photo of your crop.'
    };
  }

  const sampleWidth = 160;
  const sampleHeight = 160;
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  if (!canvas) {
    return { isValid: true, message: 'Canvas not supported' };
  }
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return {
      isValid: false,
      reason: 'corrupt',
      message: 'Could not process photo. Please try again.'
    };
  }

  // Draw scaled down to sample 100% of the image area
  ctx.drawImage(source, 0, 0, sampleWidth, sampleHeight);
  const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
  const data = imageData.data;
  const totalPixels = data.length / 4;

  const hint = (cropHint || '').toLowerCase();
  const isPodOrTuberCrop = hint.includes('groundnut') || hint.includes('peanut') || hint.includes('potato') || hint.includes('వేరుశనగ') || hint.includes('मूंगफली');

  let greenFoliageCount = 0;
  let chloroticYellowCount = 0;
  let podHuskSoilCount = 0;
  let cropNecrosisRotCount = 0;
  let fruitRedPurpleCount = 0;
  let humanFaceSkinCount = 0;
  let syntheticBlueCount = 0;
  let paperDocumentCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // 1. Chlorophyll Green Foliage (Leaves, stems, vegetative canopy)
    const isGreenFoliage = g > r * 1.05 && g > b * 1.08 && g >= 34;

    // 2. Chlorotic Yellowing / Golden Grain / Inflorescence (Yellowing, senescence, corn, wheat)
    const isChloroticYellow = r > 75 && g > 70 && Math.abs(r - g) < 55 && b < Math.min(r, g) * 0.78;

    // 3. Pods, Seeds, Tubers, Bark, Stems, and Field Soil (Tan, ochre, khaki, beige, brown)
    // Characteristic of groundnut shells, potato skins, grains, legume pods, stems, root collars
    const isPodOrHusk =
      r > 50 && g > 35 && b > 15 &&
      r >= g && g >= b * 0.70 &&
      (r - b < 140) &&
      (r + g + b > 85);

    // 4. Crop Lesions, Necrosis, and Fungal Rot (Black pod rot, anthracnose, charcoal rot, dark leaf spots)
    const isNecrosisOrRot =
      r < 80 && g < 75 && b < 70 &&
      Math.abs(r - g) < 25 && Math.abs(g - b) < 25 &&
      (r + g + b > 30);

    // 5. Vegetable & Fruit Pigments (Ripe tomatoes, red chillies, brinjals)
    const isFruitOrFlower =
      (r > 120 && r > g * 1.25 && r > b * 1.25) ||
      (r > 70 && b > 70 && g < Math.min(r, b) * 0.85);

    if (isGreenFoliage) {
      greenFoliageCount++;
    } else if (isChloroticYellow) {
      chloroticYellowCount++;
    } else if (isPodOrHusk) {
      podHuskSoilCount++;
    } else if (isNecrosisOrRot) {
      cropNecrosisRotCount++;
    } else if (isFruitOrFlower) {
      fruitRedPurpleCount++;
    }

    // 6. Distinctive Smooth Human Face Skin Tones (Human selfie / close-up portrait)
    // Human facial skin has high redness/peachiness with significant gap between R and B
    const isHumanSkinCandidate =
      r > 135 && g > 80 && b > 60 &&
      r > g + 22 && g > b + 15 &&
      r - b >= 45 &&
      !isGreenFoliage && !isNecrosisOrRot;

    if (isHumanSkinCandidate) {
      humanFaceSkinCount++;
    }

    // 7. Synthetic Blue / Cyan / Violet (Vehicles, screens, clothes)
    const isSyntheticBlue = b > r * 1.35 && b > g * 1.25 && b > 65;
    if (isSyntheticBlue) {
      syntheticBlueCount++;
    }

    // 8. Plain White Document / Paper / Screen
    const isPaperOrScreen =
      r > 200 && g > 200 && b > 195 &&
      Math.abs(r - g) < 14 && Math.abs(g - b) < 14;
    if (isPaperOrScreen) {
      paperDocumentCount++;
    }
  }

  const greenRatio = greenFoliageCount / totalPixels;
  const fruitRatio = fruitRedPurpleCount / totalPixels;
  const necrosisRatio = cropNecrosisRotCount / totalPixels;

  const totalAgriculturalRatio =
    (greenFoliageCount + chloroticYellowCount + podHuskSoilCount + cropNecrosisRotCount + fruitRedPurpleCount) / totalPixels;
  const skinRatio = humanFaceSkinCount / totalPixels;
  const blueRatio = syntheticBlueCount / totalPixels;
  const paperRatio = paperDocumentCount / totalPixels;

  // RULE 1: Synthetic vehicle, electronics, desktop screens, or intense blue/purple objects
  if (blueRatio > 0.40 && totalAgriculturalRatio < 0.15) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. Non-agricultural object or vehicle detected. Please upload a clear photo of your crop.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  // RULE 2: Document, paper sketch, notebook, or blank surface
  if (paperRatio > 0.60 && totalAgriculturalRatio < 0.12) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. Document, paper drawing, or flat surface detected. Please upload a photo of your field crop.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  // RULE 3: Human selfie or portrait photo
  // Only trigger if human skin tones dominate and there is virtually NO vegetative, fruit, pod, or necrotic crop tissue
  if (
    skinRatio > 0.38 &&
    greenRatio < 0.05 &&
    fruitRatio < 0.05 &&
    necrosisRatio < 0.04 &&
    !isPodOrTuberCrop
  ) {
    return {
      isValid: false,
      reason: 'human_or_selfie',
      message: 'Crop not detected. Person, face, or portrait illustration detected. Please upload a clear photo of your crop leaf or plant.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  // RULE 4: GENERAL AGRICULTURAL GATEKEEPER
  // Must contain at least 12% verified agricultural characteristics
  // (leaves, stems, yellowing, pod shells, grains, fruits, or necrotic spots)
  if (totalAgriculturalRatio < 0.12) {
    return {
      isValid: false,
      reason: 'not_plant',
      message: 'Crop not detected. The photo does not appear to contain an agricultural crop, leaf, pod, or plant. Random images are not accepted.',
      plantRatio: totalAgriculturalRatio,
      skinRatio,
    };
  }

  return {
    isValid: true,
    message: 'Crop photo verified',
    plantRatio: totalAgriculturalRatio,
    skinRatio,
  };
}
