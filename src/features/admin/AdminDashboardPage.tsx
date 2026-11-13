import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FolderOpen,
  Coffee,
  Puzzle,
  Eye,
  Plus,
  ArrowUpRight,
  GitCommit,
  RotateCcw,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Database,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useData';
import { useLanguage } from '@/hooks/useLanguage';
import {
  listBackups,
  createBackup,
  restoreBackup,
  getGitStatus,
  commitAndPush,
} from '@/lib/adminApi';
import { toast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { LoadingScreen } from '@/components/ui/Spinner';
import type { BackupInfo, GitStatus } from '@/types';

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { stats, loading, refetch: refetchStats } = useDashboardStats();

  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [loadingBackups, setLoadingBackups] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState('');
  const [lastPublishedHash, setLastPublishedHash] = useState<string | null>(null);

  // Restore dialog state
  const [selectedBackupToRestore, setSelectedBackupToRestore] = useState<BackupInfo | null>(null);
  const [restoring, setRestoring] = useState(false);

  const fetchBackupsAndGit = useCallback(async () => {
    setLoadingBackups(true);
    try {
      const [bks, git] = await Promise.all([
        listBackups().catch(() => []),
        getGitStatus().catch(() => null),
      ]);
      setBackups(bks);
      setGitStatus(git);
    } catch {
      // Non-fatal if backend still booting
    } finally {
      setLoadingBackups(false);
    }
  }, []);

  useEffect(() => {
    void fetchBackupsAndGit();
  }, [fetchBackupsAndGit]);

  // Create manual backup
  const handleCreateBackup = async () => {
    try {
      toast('info', language === 'ar' ? 'جارٍ إنشاء نسخة احتياطية...' : 'Creating local backup...');
      const result = await createBackup('manual-dashboard');
      toast('success', language === 'ar' ? `تم إنشاء النسخة: ${result.backupId}` : `Backup created: ${result.backupId}`);
      void fetchBackupsAndGit();
    } catch (err: any) {
      toast('error', err.message || 'Backup failed');
    }
  };

  // Safe Restore (NEVER auto-publishes)
  const handleConfirmRestore = async () => {
    if (!selectedBackupToRestore) return;
    setRestoring(true);

    try {
      const result = await restoreBackup(selectedBackupToRestore.id);
      toast('success', result.message || 'Data restored locally.');
      setSelectedBackupToRestore(null);
      void refetchStats();
      void fetchBackupsAndGit();
    } catch (err: any) {
      toast('error', err.message || 'Restore failed');
    } finally {
      setRestoring(false);
    }
  };

  // Publish to GitHub (explicit manual action)
  const handlePublishToGitHub = async () => {
    setPublishing(true);
    try {
      const msg = publishMessage.trim() || 'Manual publish from local admin workstation';
      const result = await commitAndPush(msg);

      if (result.success) {
        setLastPublishedHash(result.commitHash || null);
        toast(
          'success',
          language === 'ar'
            ? 'تم النشر بنجاح إلى GitHub! بدأ التحديث التلقائي للموقع العام.'
            : 'Successfully pushed to GitHub! CI/CD deployment started.'
        );
        setPublishMessage('');
        void fetchBackupsAndGit();
      } else {
        toast('error', result.error || 'Publishing failed. Local files preserved safely.');
      }
    } catch (err: any) {
      toast('error', err.message || 'Publishing error. Local changes are safe.');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  const statCards = [
    {
      title: t('admin.totalCategories'),
      value: stats.totalCategories,
      icon: FolderOpen,
      to: '/admin/categories',
      color: 'bg-emerald-500/10 text-emerald-700',
    },
    {
      title: t('admin.totalProducts'),
      value: stats.totalProducts,
      icon: Coffee,
      to: '/admin/products',
      color: 'bg-amber-500/10 text-amber-700',
    },
    {
      title: t('admin.totalExtras'),
      value: stats.totalExtras,
      icon: Puzzle,
      to: '/admin/extras',
      color: 'bg-indigo-500/10 text-indigo-700',
    },
    {
      title: t('admin.visibleItems'),
      value: stats.visibleProducts,
      icon: Eye,
      to: '/admin/products',
      color: 'bg-brand-olive-500/10 text-brand-olive-700',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-brand-espresso">
            {t('admin.dashboard')}
          </h1>
          <p className="text-xs md:text-sm text-brand-olive-500 mt-1">
            {language === 'ar'
              ? 'محطة إدارة منيو 3+2 قهوة مختصة — نظام تخزين محلي ذري مدعوم بالنشر السحابي'
              : '3+2 Specialty Coffee Admin Station — Local atomic storage with GitHub publishing'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/menu" target="_blank" className="btn-secondary text-xs">
            <span>{t('common.viewMenu')}</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="card p-5 hover:shadow-brand-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-brand ${card.color}`}>
                <card.icon size={20} />
              </div>
              <ArrowUpRight
                size={16}
                className="text-brand-olive-300 group-hover:text-brand-olive-600 transition-colors"
              />
            </div>
            <p className="text-xs font-medium text-brand-olive-500">{card.title}</p>
            <p className="text-2xl md:text-3xl font-bold font-serif text-brand-espresso mt-1">
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Publishing & Git Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Publish Panel */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UploadCloud size={20} className="text-brand-olive" />
              <h2 className="font-serif font-bold text-base text-brand-espresso">
                {language === 'ar' ? 'نشر التعديلات إلى الإنترنت (GitHub)' : 'Publish to Production (GitHub)'}
              </h2>
            </div>
            {gitStatus?.hasChanges ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                <AlertCircle size={12} />
                {language === 'ar' ? 'تعديلات محلية غير منشورة' : 'Unpublished local changes'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                <CheckCircle2 size={12} />
                {language === 'ar' ? 'الموقع العام متطابق' : 'Up to date with GitHub'}
              </span>
            )}
          </div>

          <p className="text-xs text-brand-olive-600 leading-relaxed">
            {language === 'ar'
              ? 'يتم حفظ كافة تعديلات الأسعار والمنتجات فوراً داخل ملفات JSON على هذا الجهاز. للترقية إلى الموقع العام المنشور للزبائن، اضغط على زر النشر بالأسفل.'
              : 'All edits and images are saved locally on this machine immediately. To update the live customer website, push changes via the button below.'}
          </p>

          <div className="space-y-2">
            <input
              type="text"
              value={publishMessage}
              onChange={(e) => setPublishMessage(e.target.value)}
              placeholder={language === 'ar' ? 'وصف التعديل (مثال: تحديث أسعار V60 والماتشا)' : 'Commit summary (e.g. Updated V60 prices)'}
              className="input-field text-xs"
            />
            <button
              onClick={handlePublishToGitHub}
              disabled={publishing}
              className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
            >
              <GitCommit size={16} />
              <span>
                {publishing
                  ? (language === 'ar' ? 'جارٍ عمل الـ Commit والرفع إلى GitHub...' : 'Pushing to GitHub...')
                  : (language === 'ar' ? 'نشر التعديلات الآن (Publish Live)' : 'Publish Live Now')}
              </span>
            </button>
          </div>

          {lastPublishedHash && (
            <p className="text-[11px] text-brand-olive-500 font-mono">
              Last commit: {lastPublishedHash} • Pipeline triggered
            </p>
          )}
        </div>

        {/* Backups Panel */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database size={20} className="text-brand-gold" />
              <h2 className="font-serif font-bold text-base text-brand-espresso">
                {language === 'ar' ? 'النسخ الاحتياطي والاستعادة المحلية' : 'Local Backups & Safe Restore'}
              </h2>
            </div>
            <button
              onClick={handleCreateBackup}
              className="btn-secondary text-xs px-3 py-1 flex items-center gap-1"
            >
              <Plus size={14} />
              <span>{language === 'ar' ? 'نسخة جديدة' : 'Backup Now'}</span>
            </button>
          </div>

          <p className="text-xs text-brand-olive-600 leading-relaxed">
            {language === 'ar'
              ? 'يحتفظ النظام بآخر 10 نسخ احتياطية كاملة محلياً. استعادة أي نسخة لا تنشر إلى الإنترنت تلقائياً، بل تتطلب تأكيداً مستقلاً.'
              : 'System keeps the latest 10 verified local backups. Restoring updates local data only and NEVER auto-publishes.'}
          </p>

          {/* Backup List */}
          <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-brand-cream-200 border border-brand-cream-200 rounded-brand p-2 bg-brand-cream-50">
            {loadingBackups ? (
              <p className="text-xs text-brand-olive-400 p-2 text-center">Loading backups...</p>
            ) : backups.length === 0 ? (
              <p className="text-xs text-brand-olive-400 p-2 text-center">No backups found.</p>
            ) : (
              backups.slice(0, 5).map((bk) => (
                <div key={bk.id} className="pt-2 pb-2 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-medium text-brand-espresso block text-[11px]">
                      {bk.id}
                    </span>
                    <span className="text-[10px] text-brand-olive-400">
                      {new Date(bk.timestamp).toLocaleString()} • {bk.counts?.products || 0} products
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedBackupToRestore(bk)}
                    className="text-xs font-semibold text-brand-olive hover:text-brand-espresso hover:underline px-2 py-1 flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>{language === 'ar' ? 'استعادة' : 'Restore'}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="card p-6">
        <h2 className="font-serif font-bold text-lg text-brand-espresso mb-4">
          {language === 'ar' ? 'إجراءات إدارة المنيو' : 'Menu Management Shortcuts'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/admin/products"
            className="flex items-center gap-3 p-4 rounded-brand border border-brand-cream-300 hover:border-brand-olive hover:bg-brand-cream-50 transition-all text-brand-espresso group"
          >
            <div className="w-10 h-10 rounded-full bg-brand-olive text-brand-cream flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('admin.addProduct')}</p>
              <p className="text-[11px] text-brand-olive-400">
                {language === 'ar' ? 'إضافة أو تعديل مشروب' : 'Manage products & prices'}
              </p>
            </div>
          </Link>

          <Link
            to="/admin/categories"
            className="flex items-center gap-3 p-4 rounded-brand border border-brand-cream-300 hover:border-brand-olive hover:bg-brand-cream-50 transition-all text-brand-espresso group"
          >
            <div className="w-10 h-10 rounded-full bg-brand-olive text-brand-cream flex items-center justify-center group-hover:scale-105 transition-transform">
              <FolderOpen size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('admin.categories')}</p>
              <p className="text-[11px] text-brand-olive-400">
                {language === 'ar' ? 'إدارة الأقسام والترتيب' : 'Reorder & rename sections'}
              </p>
            </div>
          </Link>

          <Link
            to="/admin/extras"
            className="flex items-center gap-3 p-4 rounded-brand border border-brand-cream-300 hover:border-brand-olive hover:bg-brand-cream-50 transition-all text-brand-espresso group"
          >
            <div className="w-10 h-10 rounded-full bg-brand-gold text-brand-espresso flex items-center justify-center group-hover:scale-105 transition-transform">
              <Puzzle size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold">{t('admin.extras')}</p>
              <p className="text-[11px] text-brand-olive-400">
                {language === 'ar' ? 'إضافات الحليب والسيروب' : 'Milk & syrup add-ons'}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Confirmation Dialog for Restore */}
      <ConfirmDialog
        isOpen={Boolean(selectedBackupToRestore)}
        title={language === 'ar' ? 'تأكيد الاستعادة المحلية' : 'Confirm Local Restore'}
        description={
          language === 'ar'
            ? `سيتم استرجاع بيانات الأصناف والأقسام والأسعار كما كانت في النسخة (${selectedBackupToRestore?.id}). سيتم أخذ نسخة أمان للحالة الحالية أولاً. لن يتم النشر إلى الإنترنت تلقائياً.`
            : `This will restore products, categories, and prices to the state saved in (${selectedBackupToRestore?.id}). A safety snapshot will be created first. This will NOT publish automatically to GitHub.`
        }
        confirmLabel={restoring ? 'Restoring...' : (language === 'ar' ? 'استعادة محلياً' : 'Restore Locally')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => void handleConfirmRestore()}
        onCancel={() => setSelectedBackupToRestore(null)}
      />
    </div>
  );
}
