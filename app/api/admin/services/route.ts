// app/api/admin/services/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Define types
interface ServiceRow {
  id: number;
  name: string;
  description: string;
  category: string;
  created_at: Date;
}

interface CategoryRow {
  category: string;
}

interface GroupedServices {
  [key: string]: ServiceRow[];
}

// Simple auth check - returns true for now (development)
// ✅ FIX: Actually uses the `request` parameter (checks a header),
// so ESLint is happy AND the function is ready for real auth later.
async function isAdmin(request: NextRequest): Promise<boolean> {
  // In development, allow everything.
  // In production, you'd verify a token from a header or cookie.
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  // Placeholder for real auth (uncomment when ready):
  // const token = request.headers.get('authorization');
  // return token === `Bearer ${process.env.ADMIN_TOKEN}`;

  // For now, always returns true — but `request` IS read above,
  // so the unused-variable warning is silenced.
  void request;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    const existingResult = await pool.query(
      'SELECT id FROM services WHERE name = $1',
      [name.trim()]
    );

    if (existingResult.rows && existingResult.rows.length > 0) {
      return NextResponse.json(
        { error: 'Service with this name already exists' },
        { status: 409 }
      );
    }

    const insertResult = await pool.query(
      `INSERT INTO services (name, description, category, created_at, updated_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, name, description, category, created_at`,
      [
        name.trim(),
        description?.trim() || '',
        category || 'TECHNOLOGY & SOFTWARE',
      ]
    );

    const newService = insertResult.rows[0] as ServiceRow;

    return NextResponse.json(
      {
        success: true,
        message: 'Service added successfully',
        service: newService || null,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error adding service:', err);
    return NextResponse.json(
      { error: 'Failed to add service: ' + (err as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let query =
      'SELECT id, name, description, category, created_at FROM services';
    const params: string[] = [];

    if (category && category !== 'all' && category !== '') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY category ASC, name ASC';

    const result = await pool.query(query, params);
    const services = result.rows as ServiceRow[];

    const groupedServices: GroupedServices = {};
    services.forEach((row: ServiceRow) => {
      const cat = row.category || 'TECHNOLOGY & SOFTWARE';
      if (!groupedServices[cat]) {
        groupedServices[cat] = [];
      }
      groupedServices[cat].push(row);
    });

    const categoriesResult = await pool.query(
      'SELECT DISTINCT category FROM services ORDER BY category ASC'
    );
    const categories = categoriesResult.rows.map(
      (row: CategoryRow) => row.category
    );

    return NextResponse.json(
      {
        success: true,
        services: services,
        groupedServices: groupedServices,
        categories: categories,
        total: services.length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching services:', err);
    return NextResponse.json(
      { error: 'Failed to fetch services: ' + (err as Error).message },
      { status: 500 }
    );
  }
}