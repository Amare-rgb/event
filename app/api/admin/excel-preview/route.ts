import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// Define the type for Excel row data
type ExcelRow = Record<string, string | number | boolean | null | undefined>;

// Define user type
interface ImportUser {
  email: string;
  first_name?: string;
  last_name?: string;
  course?: string;
  [key: string]: string | undefined;
}

// Define preview response type
interface PreviewResponse {
  success: boolean;
  headers: string[];
  data: ExcelRow[];
  totalRows: number;
  emailCount: number;
  users: ImportUser[];
  totalUsers: number;
  sheetName: string;
  columns: {
    required: string[];
    optional: string[];
  };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get the form data from the request
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Check if file exists
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if it's an Excel file
    const validTypes: string[] = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/)) {
      return NextResponse.json(
        { error: 'Please upload an Excel file (.xlsx or .xls)' },
        { status: 400 }
      );
    }

    // Read the file buffer
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // Get first sheet
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // Convert to JSON with proper typing
    const data: ExcelRow[] = XLSX.utils.sheet_to_json<ExcelRow>(firstSheet);

    if (data.length === 0) {
      return NextResponse.json(
        { error: 'Excel file is empty' },
        { status: 400 }
      );
    }

    // Get headers
    const headers: string[] = data.length > 0 ? Object.keys(data[0] as ExcelRow) : [];

    // Extract users with email validation
    const users: ImportUser[] = [];

    for (const row of data) {
      // Find email column (case insensitive)
      const emailKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'email'
      );

      if (!emailKey) {
        continue;
      }

      const email = row[emailKey]?.toString().trim().toLowerCase();
      
      if (!email || !email.includes('@')) {
        continue;
      }

      // Find other columns
      const firstNameKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'first_name' || 
                 key.toLowerCase().trim() === 'firstname' ||
                 key.toLowerCase().trim() === 'first name'
      );
      const lastNameKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'last_name' || 
                 key.toLowerCase().trim() === 'lastname' ||
                 key.toLowerCase().trim() === 'last name'
      );
      const courseKey = Object.keys(row).find(
        (key) => key.toLowerCase().trim() === 'course'
      );

      const user: ImportUser = {
        email,
        first_name: firstNameKey ? row[firstNameKey]?.toString().trim() : undefined,
        last_name: lastNameKey ? row[lastNameKey]?.toString().trim() : undefined,
        course: courseKey ? row[courseKey]?.toString().trim() : undefined,
      };

      // Add any additional columns as metadata
      const excludedKeys: string[] = ['email', 'first_name', 'last_name', 'course', 'firstname', 'lastname', 'first name', 'last name'];
      for (const [key, value] of Object.entries(row)) {
        if (!excludedKeys.includes(key.toLowerCase().trim())) {
          user[key] = value?.toString().trim();
        }
      }

      users.push(user);
    }

    // Get email count
    const totalEmails: number = users.length;

    // Return preview data
    const response: PreviewResponse = {
      success: true,
      headers: headers,
      data: data.slice(0, 10), // Preview first 10 rows only
      totalRows: data.length,
      emailCount: totalEmails,
      users: users.slice(0, 10), // Preview first 10 users
      totalUsers: users.length,
      sheetName: workbook.SheetNames[0],
      columns: {
        required: ['email'],
        optional: ['first_name', 'last_name', 'course']
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Excel preview error:', error);
    return NextResponse.json(
      { error: 'Failed to process Excel file' },
      { status: 500 }
    );
  }
}