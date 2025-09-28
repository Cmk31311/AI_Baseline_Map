import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Request, Response } from 'express';
import { analyzeRoute } from '../../api/analyze/route.js';

// Mock the analysis functions
vi.mock('../../lib/analysis/run.js', () => ({
  runBaselineAnalysis: vi.fn(),
  validateAnalysisOptions: vi.fn(),
  checkAnalysisFeasibility: vi.fn(),
}));

// Mock the file utilities
vi.mock('../../lib/files/unzip.js', () => ({
  validateZip: vi.fn(),
  getZipInfo: vi.fn(),
}));

// Mock fs
vi.mock('fs', () => ({
  default: {
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn(),
    existsSync: vi.fn(),
    unlinkSync: vi.fn()
  },
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  existsSync: vi.fn(),
  unlinkSync: vi.fn()
}));

import { runBaselineAnalysis, validateAnalysisOptions, checkAnalysisFeasibility } from '../../lib/analysis/run.js';
import { validateZip, getZipInfo } from '../../lib/files/unzip.js';
import { writeFileSync, mkdirSync, existsSync, unlinkSync } from 'fs';

describe('Analyze API', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockFile: any;

  beforeEach(() => {
    mockFile = {
      originalname: 'test.zip',
      size: 1024,
      buffer: Buffer.from('test content'),
    };

    mockReq = {
      file: mockFile,
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    // Reset all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should handle successful analysis', async () => {
    // Mock successful validation
    (validateZip as any).mockResolvedValue(true);
    (getZipInfo as any).mockResolvedValue({
      totalFiles: 100,
      totalSize: 1024 * 1024,
    });
    (checkAnalysisFeasibility as any).mockReturnValue({
      feasible: true,
      warnings: [],
      estimatedTime: '30s',
    });
    (validateAnalysisOptions as any).mockReturnValue({
      maxFiles: 50000,
      maxFileSize: 2 * 1024 * 1024,
      storeResults: true,
      publicUrl: 'http://localhost:3001',
    });
    (runBaselineAnalysis as any).mockResolvedValue({
      report: {
        summary: {
          ok: 10,
          affected: 5,
          unknown: 2,
          byLanguage: {
            python: { ok: 8, affected: 3, unknown: 1 },
            node: { ok: 2, affected: 2, unknown: 1 },
          },
        },
      },
      artifacts: {
        analysisId: 'test-id',
        jsonUrl: 'http://localhost:3001/api/analyze/test-id?format=json',
        csvUrl: 'http://localhost:3001/api/analyze/test-id?format=csv',
      },
    });

    await analyzeRoute(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      analysisId: 'test-id',
      summary: {
        ok: 10,
        affected: 5,
        unknown: 2,
        byLanguage: {
          python: { ok: 8, affected: 3, unknown: 1 },
          node: { ok: 2, affected: 2, unknown: 1 },
        },
      },
      artifacts: {
        jsonUrl: 'http://localhost:3001/api/analyze/test-id?format=json',
        csvUrl: 'http://localhost:3001/api/analyze/test-id?format=csv',
      },
    });
  });

  it('should reject non-ZIP files', async () => {
    mockReq.file = {
      ...mockFile,
      originalname: 'test.txt',
    };

    await analyzeRoute(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'File must be a ZIP archive',
    });
  });

  it('should reject files that are too large', async () => {
    mockReq.file = {
      ...mockFile,
      size: 300 * 1024 * 1024, // 300MB
    };

    await analyzeRoute(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'File too large: 300MB (limit: 200MB)',
    });
  });

  it('should handle missing file', async () => {
    mockReq.file = undefined;

    await analyzeRoute(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'No file provided',
    });
  });

  it('should handle invalid ZIP files', async () => {
    (validateZip as any).mockResolvedValue(false);

    await analyzeRoute(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Invalid ZIP file',
    });
  });

  it('should handle unfeasible analysis', async () => {
    (validateZip as any).mockResolvedValue(true);
    (getZipInfo as any).mockResolvedValue({
      totalFiles: 100000,
      totalSize: 500 * 1024 * 1024,
    });
    (checkAnalysisFeasibility as any).mockReturnValue({
      feasible: false,
      warnings: ['Too many files', 'File too large'],
      estimatedTime: '2h',
    });

    await analyzeRoute(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Analysis not feasible',
      warnings: ['Too many files', 'File too large'],
      details: {
        totalFiles: 100000,
        totalSize: 500 * 1024 * 1024,
        estimatedTime: '2h',
      },
    });
  });

  it('should handle analysis errors', async () => {
    (validateZip as any).mockRejectedValue(new Error('Validation failed'));

    await analyzeRoute(mockReq as Request, mockRes as Response);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      error: 'Analysis failed',
      message: 'Validation failed',
    });
  });
});