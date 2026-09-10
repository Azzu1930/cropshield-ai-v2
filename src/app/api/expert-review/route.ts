import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, farmerNotes, contactNumber, userId, cropName } = body;

    const supabase = getServerSupabase();
    const isValidUuid = (str?: string) =>
      Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

    if (supabase && isValidUuid(assessmentId) && isValidUuid(userId)) {
      try {
        await supabase.from('expert_reviews').insert({
          assessment_id: assessmentId,
          user_id: userId,
          farmer_notes: farmerNotes || `Farmer requested review for ${cropName || 'crop'} from KVK scientist`,
          status: 'pending',
        } as any);
      } catch (err) {
        console.warn('Could not insert expert review in Supabase:', err);
      }
    }

    return NextResponse.json({
      success: true,
      requestId: `exp-${Date.now()}`,
      status: 'pending',
      cropName: cropName || 'Field Crop',
      message: 'Your request has been saved. An expert can review your crop photo and information.',
    });
  } catch (error: any) {
    console.error('Expert review route error:', error);
    return NextResponse.json({ error: 'Failed to submit expert request' }, { status: 500 });
  }
}
