import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import AdminChartCard from './AdminChartCard'
import {
  computeRequestsByStatus,
  generateStatusAccessibleSummary
} from '../../utils/adminChartUtils'

/**
 * Gráfica de barras: "Solicitudes por estado"
 * Muestra las solicitudes agrupadas en los 6 estados obligatorios:
 * Pendientes, En lista de espera, Aceptadas, En progreso, Completadas y Rechazadas.
 */
export default function RequestsStatusChart({ requests = [], loading = false, error = null }) {
  const { data: statusData, total } = useMemo(() => {
    return computeRequestsByStatus(requests)
  }, [requests])

  const summary = useMemo(() => {
    return generateStatusAccessibleSummary(statusData, total)
  }, [statusData, total])

  // Custom tooltip con alto contraste y diseño ArtLink
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="chart-tooltip-box" role="tooltip">
          <p className="tooltip-title">{data.name}</p>
          <p className="tooltip-value">
            <strong>{data.total}</strong> {data.total === 1 ? 'solicitud' : 'solicitudes'} ({data.percentage})
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <AdminChartCard
      id="chart-requests-status"
      title="Solicitudes por estado"
      description="Distribución global calculada en tiempo real desde requests de JSON Server."
      badge={`Total: ${total}`}
      icon={BarChart3}
      summaryText={summary}
      tableData={statusData}
      tableHeaders={{ key: 'Estado', value: 'Solicitudes', extra: 'Porcentaje' }}
      loading={loading}
      error={error}
      isEmpty={total === 0}
      emptyMessage="No se han registrado solicitudes que coincidan con los filtros seleccionados."
    >
      <div style={{ width: '100%', height: 280, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={statusData}
            margin={{ top: 15, right: 15, left: -10, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              interval={0}
              angle={-20}
              textAnchor="end"
              height={45}
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
            <Bar dataKey="total" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {statusData.map((entry) => (
                <Cell
                  key={`cell-status-${entry.key}`}
                  fill={entry.color}
                  stroke="#1E192B"
                  strokeWidth={1.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminChartCard>
  )
}
