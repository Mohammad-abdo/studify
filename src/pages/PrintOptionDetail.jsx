import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit, Printer, BookOpen, FileText, Upload, Calendar } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';

const PrintOptionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [printOption, setPrintOption] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrintOption();
  }, [id]);

  const fetchPrintOption = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/print-options/${id}`);
      const data = response.data.data || response.data;
      setPrintOption(data);
    } catch (error) {
      toast.error('Failed to load print option');
      navigate('/print-options');
    } finally {
      setLoading(false);
    }
  };

  const getColorTypeBadge = (colorType) => {
    return colorType === 'COLOR' ? 'badge-info' : 'badge-neutral';
  };

  const getPaperTypeBadge = (paperType) => {
    return 'badge-neutral';
  };

  if (loading) {
    return <LoadingState message="Loading print option..." />;
  }

  if (!printOption) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Print Option #${printOption.id.substring(0, 8)}`}
        subtitle="Print Option Details"
        breadcrumbs={[
          { label: 'Dashboard', path: '/' },
          { label: 'Print Options', path: '/print-options' },
          { label: `Print Option #${printOption.id.substring(0, 8)}` },
        ]}
        actionLabel="Edit Print Option"
        actionIcon={Edit}
        onAction={() => navigate(`/print-options/edit/${printOption.id}`)}
        backPath="/print-options"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Source Type */}
          <div className="card-elevated">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Source</h2>
            <div className="flex items-center gap-3">
              {printOption.bookId && (
                <>
                  <BookOpen size={20} className="text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Book</p>
                    <p className="text-sm text-gray-600">{printOption.book?.title || printOption.bookId}</p>
                  </div>
                </>
              )}
              {printOption.materialId && (
                <>
                  <FileText size={20} className="text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Material</p>
                    <p className="text-sm text-gray-600">{printOption.material?.title || printOption.materialId}</p>
                  </div>
                </>
              )}
              {printOption.uploadedFileUrl && (
                <>
                  <Upload size={20} className="text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Uploaded File</p>
                    <a
                      href={printOption.uploadedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View File
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Print Configuration */}
          <div className="card-elevated">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Print Configuration</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Copies</label>
                <p className="text-gray-900 font-semibold mt-1">{printOption.copies || 1}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Paper Type</label>
                <p className="mt-1">
                  <span className={`badge ${getPaperTypeBadge(printOption.paperType)}`}>
                    {printOption.paperType || 'A4'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Color Type</label>
                <p className="mt-1">
                  <span className={`badge ${getColorTypeBadge(printOption.colorType)}`}>
                    {printOption.colorType || 'BLACK_WHITE'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Double Sided</label>
                <p className="mt-1">
                  <span className={`badge ${printOption.doubleSide ? 'badge-success' : 'badge-neutral'}`}>
                    {printOption.doubleSide ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="card-elevated">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Printer size={18} />
              Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-gray-900 mt-1">
                  <span className="badge badge-info">Active</span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Created</label>
                <p className="text-gray-900 mt-1">
                  {new Date(printOption.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintOptionDetail;

