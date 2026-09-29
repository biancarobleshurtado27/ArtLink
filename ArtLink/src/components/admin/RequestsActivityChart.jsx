import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import AdminChartCard from './AdminChartCard'
import {
  computeRequestsActivity,
  generateActivityAccessibleSummary
} from '../../utils/adminChartUtils'

/**
 * Gráfica de líneas: “Actividad de solicitudes”
 * Agrupa las solicitudes por mes o por fecha usando los datos de createdAt de JSON Server
 * y datos demostrativos coherentes claramente identificados.
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip-box" role="tooltip">
        <p className="tooltip-title">{label}</p>
        <p className="tooltip-value">
          <strong>{payload[0].value}</strong> {payload[0].value === 1 ? 'solicitud creada' : 'solicitudes creadas'}
        </p>
      </div>
    )
  }
  return null
}

export default function RequestsActivityChart({
  requests = [],
  period = 'all',
  loading = false,
  error = null
}) {
  const { data: activityData, total, peakLabel } = useMemo(() => {
    return computeRequestsActivity(requests, period)
  }, [requests, period])

  const summary = useMemo(() => {
    return generateActivityAccessibleSummary(activityData, total, peakLabel)
  }, [activityData, total, peakLabel])

  return (
    <AdminChartCard
      id="chart-requests-activity"
      title="Actividad de solicitudes"
      description="Evolución temporal de nuevas solicitudes basadas en la marca de tiempo createdAt."
      badge="Datos Demostrativos"
      icon={TrendingUp}
      summaryText={summary}
      extraNote="Nota: Las solicitudes históricas utilizan marcas de tiempo reales y demostrativas almacenadas en JSON Server para evaluar el flujo de encargos por periodo."
      tableData={activityData}
      tableHeaders={{ key: 'Intervalo / Fecha', value: 'Solicitudes creadas' }}
      loading={loading}
      error={error}
      isEmpty={total === 0}
      emptyMessage="No se registra actividad de solicitudes en el periodo seleccionado."
    >
      <div style={{ width: '100%', height: 280, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={activityData}
            margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#1E192B', fontWeight: 600 }}
              axisLine={{ stroke: '#1E192B', strokeWidth: 1.5 }}
              tickLine={{ stroke: '#1E192B' }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#1E192B', fontWeight: 600 }}
              axisLine={{ stroke: '#1E192B', strokeWidth: 1.5 }}
              tickLine={{ stroke: '#1E192B' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="cantidad"
              name="Solicitudes creadas"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ stroke: '#1E192B', strokeWidth: 2, r: 4.5, fill: '#EC4899' }}
              activeDot={{ stroke: '#1E192B', strokeWidth: 2, r: 7, fill: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AdminChartCard>
  )
}
