import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir, unlink } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'list') {
      // List files in uploads directory
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      
      try {
        const files = await readdir(uploadsDir);
        // Sort by creation time (newest first)
        const fileStats = await Promise.all(
          files.map(async (filename) => {
            const filepath = join(uploadsDir, filename);
            const stats = await import('fs').then(fs => fs.promises.stat(filepath));
            return { filename, createdAt: stats.birthtime };
          })
        );
        
        fileStats.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        
        return NextResponse.json({
          success: true,
          files: fileStats.map(f => f.filename)
        });
      } catch {
        // Directory doesn't exist yet
        return NextResponse.json({
          success: true,
          files: []
        });
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('File listing error:', error);
    return NextResponse.json(
      { error: 'Failed to list files' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }
    
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    const filepath = join(uploadsDir, filename);
    
    try {
      await unlink(filepath);
      console.log(`Deleted file: ${filename}`);
      
      return NextResponse.json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error) {
      console.error('File deletion error:', error);
      return NextResponse.json(
        { error: 'File not found or could not be deleted' },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('Delete request error:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // For now, focus on text files to avoid PDF parsing issues
    const allowedTypes = [
      'text/plain',
      'text/csv',
      'application/json'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Currently only TXT, CSV, and JSON files are supported. PDF and DOC support will be added soon.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filepath = join(uploadsDir, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Extract text content for supported file types
    let textContent = '';
    
    try {
      if (file.type === 'text/plain' || file.type === 'text/csv') {
        textContent = buffer.toString('utf-8');
      } else if (file.type === 'application/json') {
        const jsonContent = JSON.parse(buffer.toString('utf-8'));
        textContent = JSON.stringify(jsonContent, null, 2);
      }
    } catch (extractError) {
      console.error('Text extraction error:', extractError);
      // Continue with empty content if extraction fails
      textContent = '';
    }

    // Return success response with file info and extracted text
    return NextResponse.json({
      success: true,
      filename,
      filepath: `/uploads/${filename}`,
      size: file.size,
      type: file.type,
      content: textContent, // Changed from textContent to content to match frontend
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
