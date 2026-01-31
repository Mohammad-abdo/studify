import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, Plus, Edit, Trash2, ArrowDownCircle, ArrowUpCircle, Search, Filter, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import DataTable from '../components/DataTable';
import PageHeader from '../components/PageHeader';
import { useLanguage } from '../context/LanguageContext';

const FinancialTransactions = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/financial-transactions');
      setTransactions(response.data.data || response.data || []);
    } catch (error) {
      toast.error(isRTL ? 'فشل مزامنة السجلات المالية' : 'Accounting: Financial record sync failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (transaction) => {
    const result = await Swal.fire({
      title: t('pages.financialTransactions.voidEntry'),
      text: t('pages.financialTransactions.voidEntryDesc').replace('{id}', transaction.id.slice(0, 8)),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      confirmButtonText: t('pages.financialTransactions.voidTransaction'),
      reverseButtons: isRTL
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/financial-transactions/${transaction.id}`);
        toast.success(isRTL ? 'تم إلغاء المعاملة بنجاح' : 'Transaction voided successfully');
        fetchTransactions();
      } catch (error) {
        toast.error(isRTL ? 'فشل عملية الإلغاء: السجل مقفل' : 'Void operation failed: Ledger locked');
      }
    }
  };

  const columns = [
    {
      header: t('pages.financialTransactions.cashFlow'),
      accessor: 'type',
      render: (transaction) => {
        const isCredit = transaction.type === 'CREDIT' || transaction.type === 'DEPOSIT';
        return (
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-100 shadow-sm ${isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isCredit ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            </div>
            <div className="flex flex-col">
              <span className={`text-xs font-black uppercase tracking-widest ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>{transaction.type}</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">ID: {transaction.id.slice(0, 8)}</span>
            </div>
          </div>
        );
      }
    },
    {
      header: t('pages.financialTransactions.netAmount'),
      accessor: 'amount',
      render: (transaction) => {
        const isCredit = transaction.type === 'CREDIT' || transaction.type === 'DEPOSIT';
        return (
          <div className="flex flex-col">
            <span className={`text-sm font-black ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
              {isCredit ? '+' : '-'}${transaction.amount?.toFixed(2)}
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tighter">{t('pages.financialTransactions.settledAmount')}</span>
          </div>
        );
      }
    },
    {
      header: t('pages.financialTransactions.auditTrail'),
      accessor: 'description',
      render: (transaction) => (
        <p className="text-xs font-medium text-slate-500 max-w-sm truncate italic">"{transaction.description || t('pages.financialTransactions.systemGenerated')}"</p>
      )
    },
    {
      header: t('pages.financialTransactions.timestamp'),
      accessor: 'createdAt',
      hideOnMobile: true,
      render: (transaction) => (
        <div className="flex items-center gap-2 text-slate-400 font-bold">
          <Calendar size={14} />
          <span className="text-xs">{new Date(transaction.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      )
    },
    {
      header: t('pages.financialTransactions.controls'),
      accessor: 'actions',
      align: 'right',
      render: (transaction) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => navigate(`/financial-transactions/edit/${transaction.id}`)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16} /></button>
          <button onClick={() => handleDelete(transaction)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  const filteredTransactions = transactions.filter((t) => {
    const description = t.description?.toLowerCase() || '';
    const type = t.type?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return description.includes(search) || type.includes(search);
  });

  return (
    <div className="space-y-10 page-transition pb-20">
      <PageHeader
        title={t('pages.financialTransactions.title')}
        subtitle={t('pages.financialTransactions.subtitle')}
        breadcrumbs={[{ label: isRTL ? 'المحاسبة' : 'Accounting' }, { label: isRTL ? 'المعاملات' : 'Transactions' }]}
        actionLabel={t('pages.financialTransactions.registerEntry')}
        actionPath="/financial-transactions/add"
      />

      <div className="card-premium p-6 bg-white border-none shadow-xl shadow-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search size={20} className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${isRTL ? 'right-4' : 'left-4'}`} />
            <input
              type="text"
              placeholder={t('pages.financialTransactions.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full bg-slate-50 border-none rounded-2xl py-4 font-bold text-sm focus:ring-4 focus:ring-blue-500/10 transition-all ${isRTL ? 'pr-12' : 'pl-12'}`}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all border border-transparent hover:border-slate-200">
              <Filter size={20} />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('pages.financialTransactions.syncingLedger')}</span>
        </div>
      ) : (
        <div className="fade-in">
          <DataTable
            data={filteredTransactions}
            columns={columns}
            loading={false}
            searchable={false}
          />
        </div>
      )}
    </div>
  );
};

export default FinancialTransactions;
