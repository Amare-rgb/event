// app/api/admin/services/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

// Simple auth check
async function isAdmin(request: NextRequest): Promise<boolean> {
  return true;
}

// GET - Fetch a single service
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    const result = await pool.query(
      'SELECT id, name, description, category, created_at FROM services WHERE id = $1',
      [serviceId]
    );

    if (!result.rows || result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      service: result.rows[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// PUT - Update a service
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
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

    // Check if service exists
    const existingResult = await pool.query(
      'SELECT id, name FROM services WHERE id = $1',
      [serviceId]
    );

    if (!existingResult.rows || existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    // Check if another service has the same name
    const duplicateCheck = await pool.query(
      'SELECT id FROM services WHERE name = $1 AND id != $2',
      [name.trim(), serviceId]
    );

    if (duplicateCheck.rows && duplicateCheck.rows.length > 0) {
      return NextResponse.json(
        { error: 'Another service with this name already exists' },
        { status: 409 }
      );
    }

    // Update the service
    const result = await pool.query(
      `UPDATE services 
       SET name = $1, description = $2, category = $3, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $4 
       RETURNING id, name, description, category, created_at`,
      [name.trim(), description?.trim() || '', category || 'TECHNOLOGY & SOFTWARE', serviceId]
    );

    return NextResponse.json({
      success: true,
      message: 'Service updated successfully',
      service: result.rows[0]
    }, { status: 200 });

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a service by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const serviceId = parseInt(id);
    if (isNaN(serviceId)) {
      return NextResponse.json(
        { error: 'Invalid service ID' },
        { status: 400 }
      );
    }

    // Check if service exists
    const existingResult = await pool.query(
      'SELECT id, name FROM services WHERE id = $1',
      [serviceId]
    );

    if (!existingResult.rows || existingResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }

    const serviceName = existingResult.rows[0].name;

    // Check if service is being used by any service users
    const serviceUserResult = await pool.query(
      `SELECT COUNT(*) as count FROM service_users 
       WHERE course = $1 OR course ILIKE $2 OR course ILIKE $3 OR course ILIKE $4`,
      [serviceName, `${serviceName},%`, `%, ${serviceName},%`, `%, ${serviceName}`]
    );

    const count = parseInt(serviceUserResult.rows[0].count);

    if (count > 0) {
      return NextResponse.json(
        { error: `Cannot delete service "${serviceName}" because it is being used by ${count} service user(s)` },
        { status: 400 }
      );
    }

    // Delete the service
    await pool.query(
      'DELETE FROM services WHERE id = $1',
      [serviceId]
    );

    return NextResponse.json({
      success: true,
      message: `Service "${serviceName}" deleted successfully`,
      deletedId: serviceId
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service: ' + (error as Error).message },
      { status: 500 }
    );
  }
}