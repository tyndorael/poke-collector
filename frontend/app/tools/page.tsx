'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { toast } from 'sonner';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { Collection } from '@/types';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const fetcher = (url: string) => api.get(url).then((res) => res.data);

interface ImportResult {
  imported: number;
  errors: string[];
}

export default function ToolsPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { data: collectionsData } = useSWR(isAuthenticated ? '/collections' : null, fetcher);
  
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const collections: Collection[] = collectionsData?.collections || [];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.csv')) {
        toast.error('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedCollection) {
      toast.error('Please select both a file and a collection');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('overwrite', overwrite.toString());
      formData.append('format', 'csv');

      const response = await api.post(`/collections/${selectedCollection}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result: ImportResult = response.data;
      setImportResult(result);

      if (result.errors.length === 0) {
        toast.success(`Successfully imported ${result.imported} cards!`);
      } else if (result.imported > 0) {
        toast.warning(`Imported ${result.imported} cards with ${result.errors.length} errors`);
      } else {
        toast.error('Import failed with errors');
      }
    } catch (error: unknown) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to import CSV file';
      toast.error(errorMessage);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    if (!selectedCollection) {
      toast.error('Please select a collection to export');
      return;
    }

    setIsExporting(true);

    try {
      const response = await api.get(`/collections/${selectedCollection}/export?format=csv`, {
        responseType: 'blob',
      });

      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Find collection name for filename
      const collection = collections.find(c => c.id === selectedCollection);
      const filename = `${collection?.name || 'collection'}-export.csv`;
      link.download = filename;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Collection exported successfully!');
    } catch (error: unknown) {
      console.error('Export error:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to export collection';
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please log in to access tools.</div>;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Collection Tools</h1>
              <p className="text-muted-foreground">Import and export your card collections</p>
            </div>

            {/* Collection Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Collection</CardTitle>
                <CardDescription>
                  Choose the collection you want to import to or export from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="collection-select">Collection</Label>
                  <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a collection" />
                    </SelectTrigger>
                    <SelectContent>
                      {collections.map((collection) => (
                        <SelectItem key={collection.id} value={collection.id}>
                          {collection.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Import Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import from CSV
                  </CardTitle>
                  <CardDescription>
                    Upload a CSV file to import cards into your collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="csv-file">CSV File</Label>
                    <Input
                      id="csv-file"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      disabled={isImporting}
                    />
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="overwrite"
                      checked={overwrite}
                      onCheckedChange={(checked) => setOverwrite(checked as boolean)}
                      disabled={isImporting}
                    />
                    <Label htmlFor="overwrite" className="text-sm">
                      Overwrite existing cards
                    </Label>
                  </div>

                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || !selectedCollection || isImporting}
                    className="w-full"
                  >
                    {isImporting ? 'Importing...' : 'Import CSV'}
                  </Button>

                  {/* Import Results */}
                  {importResult && (
                    <div className="space-y-2">
                      <Separator />
                      <div className="space-y-2">
                        {importResult.imported > 0 && (
                          <Alert>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              Successfully imported {importResult.imported} cards
                            </AlertDescription>
                          </Alert>
                        )}
                        {importResult.errors.length > 0 && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {importResult.errors.length} error(s) occurred:
                                </p>
                                <div className="max-h-40 overflow-y-auto space-y-1">
                                  {importResult.errors.map((error, index) => (
                                    <p key={index} className="text-xs font-mono">
                                      {error}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Export Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export to CSV
                  </CardTitle>
                  <CardDescription>
                    Download your collection data as a CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Export Format</Label>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">CSV (Comma Separated Values)</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleExport}
                    disabled={!selectedCollection || isExporting}
                    className="w-full"
                    variant="outline"
                  >
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* CSV Format Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>CSV Format Information</CardTitle>
                <CardDescription>
                  Information about the expected CSV format for imports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Required Columns:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                      <li>• Card ID (required)</li>
                      <li>• Card Name, Set Name</li>
                      <li>• Quantity, Quantity Foil, Quantity Reverse, Quantity First Edition, Quantity W Promo</li>
                      <li>• Purchase Price, Condition, Language</li>
                      <li>• Is Graded, Grade Company, Grade Value</li>
                      <li>• Notes, Acquired Date</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Valid Condition Values:</h4>
                    <p className="text-sm text-muted-foreground">
                      mint, near-mint, lightly-played, moderately-played, heavily-played, damaged
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Date Format:</h4>
                    <p className="text-sm text-muted-foreground">
                      YYYY-MM-DD (e.g., 2024-01-15)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
