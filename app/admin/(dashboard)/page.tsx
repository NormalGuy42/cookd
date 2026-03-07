import { createClient } from '@/lib/supabase/server';
import { LayoutDashboard, FolderKanban, Lightbulb, Users, ShoppingCart } from 'lucide-react';

export default async function AdminOverview() {
  const supabase = await createClient();

  // Fetch metrics
  const [projectsResult, ideasResult, ordersResult, usersResult] = await Promise.all([
    supabase.from('projects').select('id', { count: 'exact', head: true }),
    supabase.from('ideas').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('user_id').then(({ data }) => {
      const uniqueUsers = new Set(data?.map(o => o.user_id) || []);
      return { count: uniqueUsers.size };
    }),
  ]);

  const metrics = [
    {
      label: 'Total Projects',
      value: projectsResult.count || 0,
      icon: FolderKanban,
      color: 'text-[var(--cookd-orange)]',
      bg: 'bg-[var(--cookd-orange)]/10',
    },
    {
      label: 'Total Ideas',
      value: ideasResult.count || 0,
      icon: Lightbulb,
      color: 'text-[var(--cookd-golden)]',
      bg: 'bg-[var(--cookd-golden)]/10',
    },
    {
      label: 'Total Users',
      value: usersResult.count || 0,
      icon: Users,
      color: 'text-[var(--cookd-green)]',
      bg: 'bg-[var(--cookd-green)]/10',
    },
    {
      label: 'Total Orders',
      value: ordersResult.count || 0,
      icon: ShoppingCart,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)]">Overview</h1>
          <p className="text-[var(--text-secondary)]">Welcome back to your kitchen dashboard.</p>
        </div>
        <div className="text-sm font-medium text-[var(--text-muted)] bg-white px-4 py-2 border border-[var(--border-light)] rounded-xl shadow-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-white border border-[var(--border-light)] rounded-2xl p-5 sm:p-8 shadow-sm card-hover group"
            >
              <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl ${metric.bg} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300`}>
                <Icon className={`${metric.color} w-6 h-6 sm:w-8 sm:h-8`} />
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-1 font-display leading-none">
                {metric.value}
              </div>
              <div className="text-[var(--text-muted)] text-sm sm:text-base font-medium font-body uppercase tracking-wider">{metric.label}</div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-[var(--border-light)] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <LayoutDashboard size={120} />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display mb-6 flex items-center gap-2">
          <span className="w-8 h-8 bg-[var(--cookd-orange)]/10 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="text-[var(--cookd-orange)]" size={18} />
          </span>
          Recent Activity
        </h2>
        <div className="bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-2xl p-10 text-center">
          <p className="text-[var(--text-muted)] font-medium">
            Recent activity will be displayed here soon.
          </p>
          <p className="text-sm text-[var(--text-muted)] mt-1 opacity-70">
            This section will showcase new projects, ideas, and order status updates.
          </p>
        </div>
      </div>
    </div>
  );
}
