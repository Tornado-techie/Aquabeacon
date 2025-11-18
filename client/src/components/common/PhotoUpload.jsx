import React, { useState, useCallback } from 'react';
import { FiCamera, FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const PhotoUpload = ({
  photos = [],
  onPhotosChange,
  maxPhotos = 5,
  maxSizeMB = 10,
  required = false,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  label = 'Photos'
}) => {
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const validateFiles = useCallback((files) => {
    const errors = [];
    
    // Check file count
    if (files.length > maxPhotos) {
      errors.push(`Maximum ${maxPhotos} photos allowed`);
    }
    
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > maxSizeMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      errors.push(`Each photo must be less than ${maxSizeMB}MB`);
    }
    
    // Check file types
    const invalidTypes = files.filter(file => !allowedTypes.includes(file.type));
    if (invalidTypes.length > 0) {
      errors.push('Only JPEG, PNG, GIF, and WebP images are allowed');
    }
    
    return errors;
  }, [maxPhotos, maxSizeMB, allowedTypes]);

  const processFiles = useCallback((files) => {
    const filesArray = Array.from(files);
    const errors = validateFiles(filesArray);
    
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }
    
    // Update parent component
    onPhotosChange(filesArray);
    
    // Create previews
    const previews = [];
    filesArray.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        previews[index] = {
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size
        };
        if (previews.filter(p => p).length === filesArray.length) {
          setPhotoPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [validateFiles, onPhotosChange]);

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const removePhoto = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPreviews = photoPreviews.filter((_, i) => i !== index);
    
    onPhotosChange(updatedPhotos);
    setPhotoPreviews(updatedPreviews);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(1);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && '*'}
      </label>
      
      {/* Upload Area */}
      <div
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          dragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          <FiCamera className="mx-auto h-12 w-12 text-gray-400" />
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
              <span>Upload photos</span>
              <input
                type="file"
                multiple
                accept={allowedTypes.join(',')}
                onChange={handleFileChange}
                className="sr-only"
                required={required && photos.length === 0}
              />
            </label>
            <p className="pl-1">or drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxSizeMB}MB each (Max {maxPhotos} photos)
          </p>
          {photos.length > 0 && (
            <p className="text-sm text-green-600 font-medium">
              {photos.length} photo(s) selected
            </p>
          )}
        </div>
      </div>
      
      {/* Photo Previews */}
      {photoPreviews.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-3">Selected Photos:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {photoPreviews.map((photoData, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photoData.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600"
                  title="Remove photo"
                >
                  <FiX className="w-4 h-4" />
                </button>
                <div className="mt-1 text-xs text-gray-500 truncate" title={photoData.name}>
                  {photoData.name}
                </div>
                <div className="text-xs text-gray-400">
                  {formatFileSize(photoData.size)}MB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload Progress or Status */}
      {required && photos.length === 0 && (
        <p className="mt-2 text-sm text-red-600">
          At least one photo is required for complaint processing
        </p>
      )}
    </div>
  );
};

export default PhotoUpload;