import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { PieChart as PieIcon } from 'lucide-react'
import AdminChartCard from './AdminChartCard'
import {
  computeArtistsByDiscipline,
  generateDisciplineAccessibleSummary
} from '../../utils/adminChartUtils'

/**
 * Gráfica circular o de dona: “Artistas por disciplina”
 * Muestra la especialización artística en la plataforma:
 * Ilustración 2D, Modelado 3D, Animación, Pixel Art, Emotes, Concept Art y otras disciplinas.
 * 
 * Regla de conteo documentada:
 * Cada disciplina declarada en el perfil del artista suma 1 mención a la oferta global.
 * Los artistas multidisciplinarios computan en cada disciplina que ofrecen activamente.
 */
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="chart-tooltip-box" role="tooltip">
        <p className="tooltip-title">{item.name}</p>
        <p className="tooltip-value">
          <strong>{item.value}</strong> artistas ({item.percentage})
        </p>
      </div>
    )
  }
  return null
}

export default function ArtistsDisciplineChart({ artists = [], loading = false, error = null }) {
  const { data: disciplineData, totalMentions, uniqueArtists } = useMemo(() => {
    return computeArtistsByDiscipline(artists)
  }, [artists])

  const summary = useMemo(() => {
    return generateDisciplineAccessibleSummary(disciplineData, totalMentions, uniqueArtists)
  }, [disciplineData, totalMentions, uniqueArtists])

  // Filtrar disciplinas activas para el renderizado del pastel
  const chartSlices = useMemo(() => {
    return disciplineData.filter(d => d.value > 0)
  }, [disciplineData])

  return (
    <AdminChartCard
      id="chart-artists-discipline"
      title="Artistas por disciplina"
      description="Oferta de especialidades y estilos artísticos en los perfiles de ArtLink."
      badge={`${uniqueArtists} artistas`}
      icon={PieIcon}
      summaryText={summary}
      extraNote="Regla de conteo: Cada disciplina registrada en el perfil de un creador suma 1 mención a la oferta artística de ArtLink. Los artistas con múltiples habilidades computan en cada disciplina que ofrecen para no invisibilizar especialidades."
      tableData={disciplineData}
      tableHeaders={{ key: 'Disciplina', value: 'Menciones', extra: 'Participación' }}
      loading={loading}
      error={error}
      isEmpty={totalMentions === 0}
      emptyMessage="No se encontraron disciplinas registradas en los perfiles de artistas."
    >
      <div style={{ width: '100%', height: 280, minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <Pie
              data={chartSlices}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={3}
              stroke="#1E192B"
              strokeWidth={1.5}
            >
              {chartSlices.map((entry, index) => (
                <Cell key={`slice-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconSize={10}
              iconType="square"
              wrapperStyle={{
                fontSize: '11px',
                fontWeight: '600',
                color: '#1E192B',
                paddingTop: '6px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </AdminChartCard>
  )
}
