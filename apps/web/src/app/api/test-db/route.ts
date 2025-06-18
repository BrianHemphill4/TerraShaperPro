import { db, plants } from '@terrasherper/db';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  try {
    const allPlants = await db.select().from(plants);

    return NextResponse.json({
      message: `Successfully fetched ${allPlants.length} plants.`,
      data: allPlants,
    }, { status: 200 });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({
      message: 'Failed to fetch plants.',
      error: error.message,
    }, { status: 500 });
  }
} 