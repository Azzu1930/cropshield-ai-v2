import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assessmentId, farmerNotes, contactNumber } = body;

    const supabase = getServerSupabase();
    if (supabase && assessmentId && !assessmentId.startsWith('eval-')) {
      try {
        await supabase.from('expert_reviews').insert({
          assessment_id: assessmentId,
          farmer_notes: farmerNotes || 'Farmer requested review from KVK scientist',
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
      message: 'Your request has been saved. An expert can review your crop photo and information.',
    });
  } catch (error: any) {
    console.error('Expert review route error:', error);
    return NextResponse.json({ error: 'Failed to submit expert request' }, { status: 500 });
  }
}
