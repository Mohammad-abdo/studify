import { FileText, Package, Users, ShoppingCart, BookOpen, Search } from 'lucide-react';

/**
 * Empty State Component
 * Provides consistent empty state UI across all pages
 */
const EmptyState = ({ 
  icon: Icon = FileText, 
  title = 'No data available',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction 
}) => {
  return (
    <div className="card-elevated text-center py-12 px-6">
      <div className="flex justify-center mb-4">
        <div className="p-4 bg-gray-100 rounded-full">
          <Icon size={32} className="text-gray-400" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// Pre-configured empty states for common entities
export const EmptyStates = {
  Books: () => (
    <EmptyState
      icon={BookOpen}
      title="No books found"
      description="Get started by adding your first book to the system."
      actionLabel="Add Book"
      onAction={() => window.location.href = '/books/add'}
    />
  ),
  Products: () => (
    <EmptyState
      icon={Package}
      title="No products found"
      description="Start by adding your first product to the catalog."
      actionLabel="Add Product"
      onAction={() => window.location.href = '/products/add'}
    />
  ),
  Users: () => (
    <EmptyState
      icon={Users}
      title="No users found"
      description="No users match your search criteria."
    />
  ),
  Orders: () => (
    <EmptyState
      icon={ShoppingCart}
      title="No orders found"
      description="Orders will appear here once customers start placing them."
    />
  ),
  Search: ({ searchTerm }) => (
    <EmptyState
      icon={Search}
      title="No results found"
      description={`No items match "${searchTerm}". Try adjusting your search terms.`}
    />
  ),
};

export default EmptyState;

