import { NextRequest, NextResponse } from 'next/server';
import { db, designElements, eq } from '@terrasherper/db';

export const runtime = 'edge';

// GET - Load design elements for a project
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const elements = await db
      .select()
      .from(designElements)
      .where(eq(designElements.projectId, projectId));

    return NextResponse.json({
      message: `Successfully fetched ${elements.length} design elements.`,
      data: elements,
    }, { status: 200 });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({
      message: 'Failed to fetch design elements.',
      error: error.message,
    }, { status: 500 });
  }
}

// POST - Save design elements for a project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, elements } = body;

    if (!projectId || !elements || !Array.isArray(elements)) {
      return NextResponse.json(
        { error: 'Project ID and elements array are required' },
        { status: 400 }
      );
    }

    // Delete existing elements for the project first
    await db
      .delete(designElements)
      .where(eq(designElements.projectId, projectId));

    // Insert new elements
    if (elements.length > 0) {
      const elementsToInsert = elements.map((element) => ({
        id: crypto.randomUUID(),
        projectId,
        elementType: element.plantId ? 'plant' : element.type || 'shape',
        name: element.plantName || element.type || 'Unknown',
        positionX: element.left?.toString() || '0',
        positionY: element.top?.toString() || '0',
        width: element.width || null,
        height: element.height || null,
        rotation: element.angle?.toString() || '0',
        properties: {
          ...element,
          // Remove duplicated properties
          left: undefined,
          top: undefined,
          width: undefined,
          height: undefined,
          angle: undefined,
        },
        layerOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await db.insert(designElements).values(elementsToInsert);
    }

    return NextResponse.json({
      message: `Successfully saved ${elements.length} design elements.`,
    }, { status: 200 });
  } catch (e) {
    const error = e as Error;
    return NextResponse.json({
      message: 'Failed to save design elements.',
      error: error.message,
    }, { status: 500 });
  }
}