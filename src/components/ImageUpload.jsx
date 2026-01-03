import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const ImageUpload = ({ 
  value, 
  onChange, 
  multiple = false, 
  maxImages = 5,
  label = 'Upload Image',
  accept = 'image/*',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState(value ? (Array.isArray(value) ? value : [value]) : []);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    // Validate file count
    if (multiple && previews.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    if (!multiple && files.length > 1) {
      toast.error('Please select only one image');
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls = [];

      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} is not an image`);
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const fileUrl = response.data.data?.fileUrl || response.data.data?.url || response.data.fileUrl || response.data.url;
        if (fileUrl) {
          uploadedUrls.push(fileUrl);
        }
      }

      if (uploadedUrls.length > 0) {
        const newPreviews = multiple ? [...previews, ...uploadedUrls] : uploadedUrls;
        setPreviews(newPreviews);
        onChange(multiple ? newPreviews : newPreviews[0] || '');
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onChange(multiple ? newPreviews : newPreviews[0] || '');
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Upload Button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={uploading || (!multiple && previews.length > 0)}
        className={`w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          uploading || (!multiple && previews.length > 0)
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-primary-300 bg-primary-50 hover:border-primary-400 hover:bg-primary-100 cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
            <span className="text-sm text-gray-600">Uploading...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="text-primary-600 mb-2" size={32} />
            <span className="text-sm font-medium text-gray-700">
              {multiple 
                ? `Upload Images (${previews.length}/${maxImages})`
                : previews.length > 0 ? 'Replace Image' : 'Click to upload image'
              }
            </span>
            <span className="text-xs text-gray-500 mt-1">
              PNG, JPG up to 5MB
            </span>
          </div>
        )}
      </button>

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className={`mt-4 grid ${multiple ? 'grid-cols-2 md:grid-cols-3 gap-4' : 'grid-cols-1'}`}>
          {previews.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

