import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, CheckCircle, Clock, XCircle, FileText, User, Building, Tag, Calendar, Download } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

const MaterialDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/materials/${id}`);
      const materialData = response.data.data || response.data;
      
      // Parse imageUrls if it's a string
      if (materialData.imageUrls && typeof materialData.imageUrls === 'string') {
        materialData.imageUrls = JSON.parse(materialData.imageUrls);
      }
      
      setMaterial(materialData);
    } catch (error) {
      toast.error('Failed to load material');
      navigate('/materials');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'PENDING':
        return <Clock className="text-yellow-600" size={20} />;
      case 'REJECTED':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'badge-success';
      case 'PENDING':
        return 'badge-warning';
      case 'REJECTED':
        return 'badge-danger';
      default:
        return 'badge-neutral';
    }
  };

  if (loading) {
    return <LoadingState message="Loading material..." />;
  }

  if (!material) {
    return null;
  }

  const images = Array.isArray(material.imageUrls) ? material.imageUrls : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={material.title}
        subtitle="Material Details"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Materials', path: '/materials' },
          { label: material.title },
        ]}
        actionLabel="Edit Material"
        actionIcon={Edit}
        onAction={() => navigate(`/materials/edit/${material.id}`)}
        backPath="/materials"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Badge */}
          <div className="card-elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(material.approvalStatus)}
                <span className={`badge ${getStatusBadge(material.approvalStatus)}`}>
                  {material.approvalStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Images */}
          {images.length > 0 && (
            <div className="card-elevated">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Images</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={img.startsWith('http') ? img : `${api.defaults.baseURL.replace('/api', '')}${img}`}
                      alt={`${material.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(material.title)}&background=f97316&color=fff&size=200`;
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="card-elevated">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{material.description}</p>
          </div>

          {/* File */}
          {material.fileUrl && (
            <div className="card-elevated">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">File</h2>
              <a
                href={material.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Download size={18} />
                Download Material
              </a>
            </div>
          )}

          {/* Pricing */}
          {material.pricing && material.pricing.length > 0 && (
            <div className="card-elevated">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-2">
                {material.pricing.map((price, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{price.accessType}</span>
                    <span className="text-gray-700">${price.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="card-elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Material Type</label>
                <p className="text-gray-900 mt-1">{material.materialType || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Pages</label>
                <p className="text-gray-900 mt-1">{material.totalPages || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Downloads</label>
                <p className="text-gray-900 mt-1">{material.downloadCount || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900 mt-1">
                  {new Date(material.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Category */}
          {material.category && (
            <div className="card-elevated">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Tag size={18} />
                Category
              </h3>
              <p className="text-gray-900">{material.category.name}</p>
            </div>
          )}

          {/* Doctor */}
          {material.doctor && (
            <div className="card-elevated">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} />
                Doctor
              </h3>
              <p className="text-gray-900">{material.doctor.user?.phone || 'N/A'}</p>
            </div>
          )}

          {/* College & Department */}
          {(material.college || material.department) && (
            <div className="card-elevated">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building size={18} />
                Location
              </h3>
              <div className="space-y-2">
                {material.college && (
                  <p className="text-gray-900">
                    <span className="text-gray-600">College:</span> {material.college.name}
                  </p>
                )}
                {material.department && (
                  <p className="text-gray-900">
                    <span className="text-gray-600">Department:</span> {material.department.name}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;

