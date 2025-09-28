import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FileUploader } from '../../../src/components/analyzer/FileUploader';

// Mock react-dropzone
vi.mock('react-dropzone', () => ({
  useDropzone: vi.fn(() => ({
    getRootProps: vi.fn(() => ({})),
    getInputProps: vi.fn(() => ({})),
    isDragReject: false,
  })),
}));

describe('FileUploader', () => {
  const mockOnFileSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload interface', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} />);

    expect(screen.getByText('Upload your project ZIP file')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop your ZIP file here, or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Browse Files')).toBeInTheDocument();
  });

  it('should show loading state when uploading', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={true} />);

    expect(screen.getByText('Analyzing your code...')).toBeInTheDocument();
    expect(screen.getByText('This may take a few moments depending on the size of your project.')).toBeInTheDocument();
  });

  it('should show file requirements', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} />);

    expect(screen.getByText('• Maximum file size: 200 MB')).toBeInTheDocument();
    expect(screen.getByText('• Supported formats: ZIP archive')).toBeInTheDocument();
    expect(screen.getByText('• The ZIP should contain your project source code')).toBeInTheDocument();
  });

  it('should show example projects', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} />);

    expect(screen.getByText('Example projects you can test with:')).toBeInTheDocument();
    expect(screen.getByText('React project with package.json')).toBeInTheDocument();
    expect(screen.getByText('Python project with requirements.txt')).toBeInTheDocument();
    expect(screen.getByText('Java project with pom.xml')).toBeInTheDocument();
    expect(screen.getByText('Go project with go.mod')).toBeInTheDocument();
  });

  it('should use custom max size', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} maxSize={100 * 1024 * 1024} />);

    expect(screen.getByText('• Maximum file size: 100 MB')).toBeInTheDocument();
  });

  it('should use custom accepted types', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} acceptedTypes={['.tar.gz']} />);

    expect(screen.getByText('• Supported formats: ZIP archive')).toBeInTheDocument();
  });

  it('should show drag and drop area', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} />);

    const dropzone = screen.getByText('Upload your project ZIP file').closest('div');
    expect(dropzone).toHaveClass('cursor-pointer');
  });

  it('should disable input when uploading', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={true} />);

    const input = screen.getByRole('textbox', { hidden: true });
    expect(input).toBeDisabled();
  });

  it('should show upload icon', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} />);

    const icon = screen.getByText('Upload your project ZIP file').closest('div')?.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should show browse button', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} />);

    const browseButton = screen.getByText('Browse Files');
    expect(browseButton).toBeInTheDocument();
    expect(browseButton).toHaveClass('bg-blue-600');
  });

  it('should not show example projects when uploading', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={true} />);

    expect(screen.queryByText('Example projects you can test with:')).not.toBeInTheDocument();
  });

  it('should show spinner when uploading', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={true} />);

    const spinner = screen.getByText('Analyzing your code...').closest('div')?.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should format file sizes correctly', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} maxSize={1024 * 1024} />);

    expect(screen.getByText('• Maximum file size: 1 MB')).toBeInTheDocument();
  });

  it('should handle zero file size', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} maxSize={0} />);

    expect(screen.getByText('• Maximum file size: 0 Bytes')).toBeInTheDocument();
  });

  it('should handle large file sizes', () => {
    render(<FileUploader onFileSelect={mockOnFileSelect} isUploading={false} maxSize={1024 * 1024 * 1024} />);

    expect(screen.getByText('• Maximum file size: 1 GB')).toBeInTheDocument();
  });
});