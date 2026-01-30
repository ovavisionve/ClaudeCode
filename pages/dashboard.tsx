import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import Head from 'next/head';
import { Users, Calendar, CheckSquare, TrendingUp, DollarSign, Target } from 'lucide-react';

interface MetricCard {
  title: string;
  value: string | number;
  change: string;
  icon: any;
  color: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      title: 'Total Contactos',
      value: '0',
      change: '+0% del mes pasado',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Reuniones Hoy',
      value: '0',
      change: '0 pendientes',
      icon: Calendar,
      color: 'bg-green-500',
    },
    {
      title: 'Tareas Activas',
      value: '0',
      change: '0 urgentes',
      icon: CheckSquare,
      color: 'bg-yellow-500',
    },
    {
      title: 'Pipeline Activo',
      value: '$0',
      change: '0 oportunidades',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Cotizaciones',
      value: '0',
      change: '0 pendientes',
      icon: DollarSign,
      color: 'bg-pink-500',
    },
    {
      title: 'Tasa de Conversión',
      value: '0%',
      change: 'Del último trimestre',
      icon: Target,
      color: 'bg-indigo-500',
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real metrics from API
    // For now, simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <>
      <Head>
        <title>Dashboard - OVA CRM</title>
      </Head>

      <Layout title="Dashboard">
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg">
            <h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta! 👋</h2>
            <p className="text-primary-100">
              Aquí tienes un resumen de tu actividad en el CRM
            </p>
          </div>

          {/* Metrics Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-6 shadow-sm animate-pulse"
                >
                  <div className="h-12 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                return (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow card-hover fade-in"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${metric.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <span className="text-xs font-medium px-3 py-1 bg-gray-100 rounded-full text-gray-600">
                        {metric.change}
                      </span>
                    </div>
                    <h3 className="text-gray-600 text-sm font-medium mb-1">
                      {metric.title}
                    </h3>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Meetings */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Próximas Reuniones
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center py-8">
                  No hay reuniones próximas
                </p>
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tareas Recientes
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-500 text-center py-8">
                  No hay tareas recientes
                </p>
              </div>
            </div>
          </div>

          {/* Pipeline Overview */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estado del Pipeline
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['Prospecto', 'Calificado', 'Propuesta', 'Negociación', 'Cerrado'].map(
                (stage, index) => (
                  <div key={index} className="text-center">
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-400">0</span>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{stage}</p>
                    <p className="text-xs text-gray-500">$0</p>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
