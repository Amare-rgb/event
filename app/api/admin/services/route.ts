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
async function isAdmin(request: NextRequest): Promise<boolean> {
  return true;
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, category } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    // Check if service already exists
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

    // Insert new service with category
    const insertResult = await pool.query(
      `INSERT INTO services (name, description, category, created_at, updated_at) 
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, name, description, category, created_at`,
      [name.trim(), description?.trim() || '', category || 'TECHNOLOGY & SOFTWARE']
    );

    const newService = insertResult.rows[0] as ServiceRow;

    return NextResponse.json({
      success: true,
      message: 'Service added successfully',
      service: newService || null
    }, { status: 201 });

  } catch (error) {
    console.error('Error adding service:', error);
    return NextResponse.json(
      { error: 'Failed to add service: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let query = 'SELECT id, name, description, category, created_at FROM services';
    const params: string[] = [];

    if (category && category !== 'all' && category !== '') {
      query += ' WHERE category = $1';
      params.push(category);
    }

    query += ' ORDER BY category ASC, name ASC';

    const result = await pool.query(query, params);
    const services = result.rows as ServiceRow[];

    // Group services by category
    const groupedServices: GroupedServices = {};
    services.forEach((row: ServiceRow) => {
      const cat = row.category || 'TECHNOLOGY & SOFTWARE';
      if (!groupedServices[cat]) {
        groupedServices[cat] = [];
      }
      groupedServices[cat].push(row);
    });

    // Get all unique categories
    const categoriesResult = await pool.query(
      'SELECT DISTINCT category FROM services ORDER BY category ASC'
    );
    const categories = categoriesResult.rows.map((row: CategoryRow) => row.category);

    return NextResponse.json({
      success: true,
      services: services,
      groupedServices: groupedServices,
      categories: categories,
      total: services.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services: ' + (error as Error).message },
      { status: 500 }
    );
  }
}