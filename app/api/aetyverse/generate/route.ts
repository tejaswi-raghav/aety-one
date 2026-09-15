import { env } from 'cloudflare:workers';

export const runtime = 'edge';

const MODEL = 'gpt-image-2.5-sunburst';
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;
const MAX_PRODUCTS = 4;
const GENERATION_COOLDOWN_MS = 60_000;

const productReferences: Record<string, { asset: string; label: string; description: string }> = {
  'distorted-football-jersey': {
    asset: '/assets/tryon-jersey.png',
    label: 'Æ1 DISTORTED FOOTBALL JERSEY',
    description: 'black and bone oversized mesh football jersey with contrast piping and Æ1 graphics',
  },
  'system-longsleeve': {
    asset: '/assets/tryon-system-set.png',
    label: 'SYSTEM LONGSLEEVE',
    description: 'faded black oversized long-sleeve top with distressed system graphics and extended cuffs',
  },
  'terrace-track-pant': {
    asset: '/assets/tryon-system-set.png',
    label: 'TERRACE TRACK PANT',
    description: 'black and grey relaxed wide-leg technical track pant with contrast piping',
  },
  'a1-tech-shell': {
    asset: '/assets/tryon-shell.png',
    label: 'Æ1 TECH SHELL',
    description: 'charcoal oversized high-collar technical shell with articulated panels',
  },
};

const recentRequests = new Map<string, number>();

function json(body: unknown, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });
}

function getApiKey() {
  return (env as unknown as Record<string, string | undefined>).OPENAI_API_KEY?.trim();
}

function clientId(request: Request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
}

function checkCooldown(request: Request) {
  const now = Date.now();
  const id = clientId(request);
  const previous = recentRequests.get(id) || 0;

  if (recentRequests.size > 500) {
    for (const [key, timestamp] of recentRequests) {
      if (now - timestamp > GENERATION_COOLDOWN_MS * 2) recentRequests.delete(key);
    }
  }

  if (now - previous < GENERATION_COOLDOWN_MS) {
    return Math.ceil((GENERATION_COOLDOWN_MS - (now - previous)) / 1000);
  }

  recentRequests.set(id, now);
  return 0;
}

export async function GET() {
  return json({ configured: Boolean(getApiKey()), model: MODEL });
}

export async function POST(request: Request) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return json({
      error: 'AetyVerse generation is awaiting secure API configuration.',
      code: 'engine_not_configured',
    }, 503);
  }

  const retryAfter = checkCooldown(request);
  if (retryAfter) {
    return json({
      error: `Please wait ${retryAfter} seconds before generating another look.`,
      code: 'rate_limited',
      retryAfter,
    }, 429);
  }

  let input: FormData;
  try {
    input = await request.formData();
  } catch {
    return json({ error: 'The generation request could not be read.', code: 'invalid_request' }, 400);
  }

  const source = input.get('photo');
  const mode = input.get('mode') === 'add' ? 'add' : 'replace';
  const productSlugs = [...new Set(input.getAll('products').filter((value): value is string => typeof value === 'string'))];
  const rawProfile = input.get('profile');
  let profileContext = '';
  if (typeof rawProfile === 'string' && rawProfile.length < 1000) {
    try {
      const profile = JSON.parse(rawProfile) as Record<string, unknown>;
      const allowed = ['height', 'chest', 'waist', 'hips', 'shoulder', 'inseam', 'fitPreference'];
      const details = allowed.flatMap((key) => typeof profile[key] === 'string' && /^[a-z0-9. -]{1,20}$/i.test(profile[key] as string) ? [`${key}: ${profile[key]}${key === 'fitPreference' ? '' : ' cm'}`] : []);
      if (details.length) profileContext = `\nCalibrated customer profile: ${details.join(', ')}.`;
    } catch {
      profileContext = '';
    }
  }

  if (!(source instanceof File)) {
    return json({ error: 'Upload a source image before generating.', code: 'missing_photo' }, 400);
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(source.type) || source.size > MAX_SOURCE_BYTES) {
    return json({ error: 'Use a JPG, PNG or WEBP source image under 12 MB.', code: 'invalid_photo' }, 400);
  }
  if (!productSlugs.length || productSlugs.length > MAX_PRODUCTS || productSlugs.some((slug) => !productReferences[slug])) {
    return json({ error: 'Select between one and four valid AETY ONE products.', code: 'invalid_products' }, 400);
  }

  const selected = productSlugs.map((slug) => productReferences[slug]);
  const selectedDescription = selected.map((product, index) => `${index + 1}. ${product.label}: ${product.description}`).join('\n');
  const instruction = mode === 'replace'
    ? 'Replace the visible clothing on the person with the selected products.'
    : 'Add the selected products naturally to the current outfit, replacing only directly conflicting garments.';

  const prompt = `Create a photorealistic virtual try-on edit. ${instruction}${profileContext}

Selected products:
${selectedDescription}

Use the supplied product reference images as the exact design source. Preserve the person's identity, face, expression, hair, skin tone, body proportions, pose, hands, camera angle, lighting, and background. Do not reshape or beautify the body. Make garment scale and fit plausible for the person's visible proportions. Preserve exact product colors, graphics, materials, silhouette, trims, and construction. Add realistic fabric folds, drape, perspective, occlusion, contact shadows, and lighting. Do not add logos, text, accessories, or garments that are absent from the references. Return one clean edited fashion photograph without borders or captions.`;

  const outgoing = new FormData();
  outgoing.append('model', MODEL);
  outgoing.append('prompt', prompt);
  outgoing.append('quality', 'high');
  outgoing.append('size', '1024x1536');
  outgoing.append('input_fidelity', 'high');
  outgoing.append('image[]', source, source.name || 'source.png');

  const uniqueAssets = [...new Set(selected.map((product) => product.asset))];
  try {
    for (const [index, asset] of uniqueAssets.entries()) {
      const assetResponse = await fetch(new URL(asset, request.url));
      if (!assetResponse.ok) throw new Error('reference_unavailable');
      outgoing.append('image[]', await assetResponse.blob(), `product-${index + 1}.png`);
    }
  } catch {
    return json({ error: 'A product reference is temporarily unavailable. Please try again.', code: 'reference_unavailable' }, 503);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: outgoing,
    });
    const result = await response.json() as {
      data?: Array<{ b64_json?: string }>;
      error?: { message?: string; code?: string };
    };

    if (!response.ok) {
      const status = response.status === 429 ? 429 : response.status >= 500 ? 503 : 400;
      const message = response.status === 429
        ? 'The image engine is busy. Please wait a minute and try again.'
        : response.status >= 500
          ? 'The image engine is temporarily unavailable. Please try again.'
          : 'This image could not be edited. Try a clear, well-lit photo with the person fully visible.';
      return json({ error: message, code: result.error?.code || 'generation_failed' }, status);
    }

    const encoded = result.data?.[0]?.b64_json;
    if (!encoded) return json({ error: 'The image engine returned no result. Please try again.', code: 'empty_result' }, 502);

    return json({ image: `data:image/png;base64,${encoded}`, model: MODEL });
  } catch {
    return json({ error: 'AetyVerse could not reach the image engine. Please try again.', code: 'provider_unavailable' }, 503);
  }
}
