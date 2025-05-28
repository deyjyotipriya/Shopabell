'use client';

import { useState, useCallback } from 'react';
import { Upload, X, Link, Video, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  enableAI?: boolean;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
  enableAI = true
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [showUrlImport, setShowUrlImport] = useState(false);
  const [showLivestreamImport, setShowLivestreamImport] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [livestreamUrl, setLivestreamUrl] = useState('');
  const [aiOptions, setAiOptions] = useState({
    removeBackground: false,
    autoCrop: true,
    enhance: true
  });

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      alert(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });
    
    formData.append('options', JSON.stringify(aiOptions));

    try {
      const response = await fetch('/api/products/bulk-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const { urls } = await response.json();
      onImagesChange([...images, ...urls]);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, aiOptions, onImagesChange]);

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;

    setUploading(true);
    try {
      const response = await fetch('/api/products/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput, options: aiOptions })
      });

      if (!response.ok) throw new Error('Import failed');

      const { url } = await response.json();
      onImagesChange([...images, url]);
      setUrlInput('');
      setShowUrlImport(false);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import image from URL');
    } finally {
      setUploading(false);
    }
  };

  const handleLivestreamImport = async () => {
    if (!livestreamUrl.trim()) return;

    setUploading(true);
    try {
      const response = await fetch('/api/products/process-livestream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          videoUrl: livestreamUrl,
          timestamps: [10, 30, 60, 90] // Example timestamps
        })
      });

      if (!response.ok) throw new Error('Processing failed');

      const { urls } = await response.json();
      onImagesChange([...images, ...urls]);
      setLivestreamUrl('');
      setShowLivestreamImport(false);
    } catch (error) {
      console.error('Livestream processing error:', error);
      alert('Failed to process livestream');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Product Images ({images.length}/{maxImages})
        </label>
        {enableAI && (
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={aiOptions.removeBackground}
                onChange={(e) => setAiOptions({ ...aiOptions, removeBackground: e.target.checked })}
                className="rounded"
              />
              Remove Background
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={aiOptions.autoCrop}
                onChange={(e) => setAiOptions({ ...aiOptions, autoCrop: e.target.checked })}
                className="rounded"
              />
              Auto Crop
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={aiOptions.enhance}
                onChange={(e) => setAiOptions({ ...aiOptions, enhance: e.target.checked })}
                className="rounded"
              />
              Enhance
            </label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative aspect-square">
            <Image
              src={image}
              alt={`Product ${index + 1}`}
              fill
              className="object-cover rounded-lg"
            />
            <button
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <label className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer flex items-center justify-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="sr-only"
              disabled={uploading}
            />
            {uploading ? (
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            ) : (
              <div className="text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                <span className="text-xs text-gray-500 mt-2">Upload Images</span>
              </div>
            )}
          </label>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setShowUrlImport(!showUrlImport)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
        >
          <Link className="w-4 h-4" />
          Import from URL
        </button>
        <button
          type="button"
          onClick={() => setShowLivestreamImport(!showLivestreamImport)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-md"
        >
          <Video className="w-4 h-4" />
          Import from Livestream
        </button>
      </div>

      {showUrlImport && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Enter image URL"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="button"
            onClick={handleUrlImport}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Importing...' : 'Import'}
          </button>
        </div>
      )}

      {showLivestreamImport && (
        <div className="flex gap-2">
          <input
            type="url"
            value={livestreamUrl}
            onChange={(e) => setLivestreamUrl(e.target.value)}
            placeholder="Enter livestream URL"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            type="button"
            onClick={handleLivestreamImport}
            disabled={uploading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Processing...' : 'Process'}
          </button>
        </div>
      )}
    </div>
  );
}