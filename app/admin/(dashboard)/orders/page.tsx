'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Order } from '@/types/database';
import { Lightbulb, Eye, Trash2, ChevronDown, ShoppingCart } from 'lucide-react';
import OrderDetailsModal from '@/components/admin/OrderDetailsModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { toast } from 'sonner';

interface OrderWithUser extends Order {
  user_email?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithUser | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; orderId: string | null; orderInfo: string }>({
    isOpen: false,
    orderId: null,
    orderInfo: '',
  });
  const [deleting, setDeleting] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);

    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
      setLoading(false);
      return;
    }

    const userIds = [...new Set((ordersData || []).map(o => o.user_id))];

    const userEmails: Record<string, string> = {};
    for (const userId of userIds) {
      try {
        const res = await fetch(`/api/admin/user-email?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.email) {
            userEmails[userId] = data.email;
          }
        }
      } catch (e) {
        console.error('Error fetching user email:', e);
      }
    }

    const ordersWithUsers = (ordersData || []).map(order => ({
      ...order,
      user_email: order.user_id ? userEmails[order.user_id] : undefined,
    }));

    setOrders(ordersWithUsers);
    setLoading(false);
  };

  const filteredOrders = orders.filter((order) =>
    statusFilter === 'all' || order.status === statusFilter
  );

  const openDeleteModal = (order: OrderWithUser) => {
    const orderInfo = `${formatAmount(order.amount)} - ${order.user_email || order.payer_email || 'Guest'}`;
    setDeleteModal({ isOpen: true, orderId: order.id, orderInfo });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, orderId: null, orderInfo: '' });
  };

  const handleDeleteOrder = async () => {
    if (!deleteModal.orderId) return;
    
    setDeleting(true);
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', deleteModal.orderId);

    if (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    } else {
      toast.success('Order deleted successfully');
      fetchOrders();
    }
    
    setDeleting(false);
    closeDeleteModal();
  };

  const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const getTierLabel = (amount: number) => {
    if (amount === 30000) return 'Premium';
    if (amount === 15000) return 'Standard';
    if (amount === 7500) return 'Hall of Famer';
    if (amount === 5000) return 'Bare Minimum';
    return formatAmount(amount);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    completed: 'bg-[var(--cookd-green)]/10 text-[var(--cookd-green)] border-[var(--cookd-green)]/20',
    failed: 'bg-red-50 text-red-500 border-red-100',
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
          <div className="text-[var(--text-muted)] font-medium">Loading orders...</div>
        </div>
      </div>
    );
  }

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.amount, 0);

  const ordersNeedingProject = orders.filter(
    (o) => o.status === 'completed' && !o.project_id && o.idea_description
  );

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] mb-2">Orders</h1>
        <p className="text-[var(--text-secondary)]">View and manage customer payments and project requests.</p>
      </div>

      {/* Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 sm:p-8 shadow-sm card-hover">
          <div className="text-[var(--text-muted)] text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Total Orders</div>
          <div className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] font-display">{orders.length}</div>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 sm:p-8 shadow-sm card-hover">
          <div className="text-[var(--text-muted)] text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Completed</div>
          <div className="text-3xl sm:text-4xl font-bold text-[var(--cookd-green)] font-display">
            {orders.filter((o) => o.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 sm:p-8 shadow-sm card-hover">
          <div className="text-[var(--text-muted)] text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Revenue</div>
          <div className="text-3xl sm:text-4xl font-bold text-[var(--cookd-orange)] font-display">{formatAmount(totalRevenue)}</div>
        </div>
        <div className="bg-white border border-[var(--border-light)] rounded-2xl p-6 sm:p-8 shadow-sm card-hover">
          <div className="text-[var(--text-muted)] text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">Needs Project</div>
          <div className="text-3xl sm:text-4xl font-bold text-blue-500 font-display">
            {ordersNeedingProject.length}
          </div>
        </div>
      </div>

      {/* Alert for orders needing projects */}
      {ordersNeedingProject.length > 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-6 animate-pulse-subtle">
          <div className="flex items-center gap-4 text-blue-600 font-medium">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Lightbulb size={20} />
            </div>
            <span>
              <strong className="block text-lg font-bold font-display leading-tight">{ordersNeedingProject.length} Order{ordersNeedingProject.length > 1 ? 's' : ''} Ready</strong>
              <span className="text-sm opacity-80">Ideas have been submitted and are ready for project creation.</span>
            </span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
        <div className="relative w-full sm:w-64">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-6 py-3.5 bg-white border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] font-bold text-sm uppercase tracking-wide appearance-none shadow-sm cursor-pointer focus:outline-none focus:border-[var(--cookd-orange)]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
            <ChevronDown size={16} />
          </div>
        </div>
        
        <div className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs bg-[var(--surface-cream)] px-4 py-2 rounded-full border border-[var(--border-light)]">
          Total: {filteredOrders.length}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="bg-white border border-[var(--border-light)] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[var(--surface-cream)] border-b border-[var(--border-light)]">
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Amount
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Project
                </th>
                <th className="px-8 py-5 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Date
                </th>
                <th className="px-8 py-5 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <ShoppingCart className="text-[var(--border-medium)]" size={40} />
                      <p className="text-[var(--text-muted)] font-medium">
                        {statusFilter !== 'all' ? 'No orders found with this status.' : 'No orders yet.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-[var(--surface-cream)]/50 cursor-pointer transition-colors group"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-[var(--text-primary)] font-bold text-sm group-hover:text-[var(--cookd-orange)] transition-colors">
                        {order.user_email || order.payer_email || (
                          order.user_id 
                            ? <span className="text-[var(--text-muted)] font-mono text-xs">{order.user_id.slice(0, 12)}...</span>
                            : <span className="text-[var(--text-muted)]">Guest</span>
                        )}
                      </div>
                      {order.hall_of_fame_position && (
                        <div className="text-[var(--cookd-golden)] text-xs font-bold mt-0.5 uppercase tracking-wide">Ranked #{order.hall_of_fame_position}</div>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-[var(--text-primary)] font-bold">{formatAmount(order.amount)}</div>
                      <div className="text-[var(--text-muted)] text-xs font-medium">{getTierLabel(order.amount)}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border shadow-sm ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {order.project_id ? (
                        <span className="flex items-center gap-1.5 text-[var(--cookd-green)] text-xs font-bold uppercase tracking-wide">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--cookd-green)]" />
                          Created
                        </span>
                      ) : order.idea_description ? (
                        <span className="flex items-center gap-1.5 text-blue-500 text-xs font-bold uppercase tracking-wide">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          Ready to Build
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-wide opacity-50">Pending Idea</span>
                      )}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-[var(--text-muted)] font-medium">
                      {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--cookd-orange)] hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-[var(--border-light)] transition-all"
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(order);
                          }}
                          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"
                          title="Delete order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onProjectCreated={fetchOrders}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteOrder}
        title="Delete Order"
        message={`Are you sure you want to delete this order (${deleteModal.orderInfo})? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
