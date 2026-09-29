import { useState } from 'react'
import { Table, EyeOff, AlertCircle } from 'lucide-react'
import ChartSummary from './ChartSummary'
import LoadingState from '../LoadingState'
import EmptyState from '../EmptyState'

/**
 * Tarjeta contenedora recta y alineada para visualizaciones del panel administrativo.
 * Integra título, descripción breve, gráfica responsive, estado accesible con tabla de datos
 * y resumen textual.
 */
export default function AdminChartCard({
  id,
  title,
  description,
  badge,
  icon: Icon,
  children,
  summaryText,
  extraNote,
  tableData = [],
  tableHeaders = { key: 'Categoría', value: 'Cantidad' },
  loading = false,
  error = null,
  isEmpty = false,
  emptyMessage = 'No existen registros para los criterios especificados.'
}) {
  const [showTable, setShowTable] = useState(false)

  return (
    <article
      id={id}
      className="admin-chart-card"
      aria-label={`Visualización analítica: ${title}`}
    >
      {/* Encabezado recto y alineado */}
      <div className="chart-card-header">
        <div className="chart-title-group">
          <div className="chart-title-row">
            {Icon && <Icon size={18} className="chart-title-icon" aria-hidden="true" />}
            <h2>{title}</h2>
          </div>
          {description && <p className="chart-card-desc">{description}</p>}
        </div>

        <div className="chart-header-actions">
          {badge && <span className="chart-badge">{badge}</span>}
          {tableData.length > 0 && !loading && !error && !isEmpty && (
            <button
              type="button"
              className="chart-table-toggle-btn"
              onClick={() => setShowTable(prev => !prev)}
              aria-expanded={showTable}
              aria-controls={`${id}-data-table`}
              title={showTable ? 'Ocultar tabla de datos' : 'Ver datos en formato tabla'}
            >
              {showTable ? <EyeOff size={14} aria-hidden="true" /> : <Table size={14} aria-hidden="true" />}
              <span>{showTable ? 'Ocultar tabla' : 'Ver tabla'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Estados del componente */}
      {loading ? (
        <div className="chart-state-container">
          <LoadingState label={`Cargando datos para ${title}...`} />
        </div>
      ) : error ? (
        <div className="chart-state-container chart-error-state" role="alert">
          <AlertCircle size={28} className="chart-error-icon" aria-hidden="true" />
          <p className="chart-state-msg">Error al cargar datos del gráfico</p>
          <small>{error.message || String(error)}</small>
        </div>
      ) : isEmpty ? (
        <div className="chart-state-container">
          <EmptyState title="Sin registros disponibles" description={emptyMessage} />
        </div>
      ) : (
        <>
          {/* Gráfico interactivo */}
          <div className="chart-body" aria-hidden={showTable ? 'true' : 'false'}>
            {children}
          </div>

          {/* Tabla accesible con datos numéricos legibles */}
          {showTable && tableData.length > 0 && (
            <div id={`${id}-data-table`} className="chart-accessible-table-wrap">
              <table className="chart-accessible-table">
                <caption className="sr-only">Tabla de datos para {title}</caption>
                <thead>
                  <tr>
                    <th scope="col">{tableHeaders.key}</th>
                    <th scope="col" className="text-right">{tableHeaders.value}</th>
                    {tableHeaders.extra && <th scope="col" className="text-right">{tableHeaders.extra}</th>}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, idx) => (
                    <tr key={idx}>
                      <th scope="row" className="row-label">
                        {row.color && (
                          <span
                            className="row-color-swatch"
                            style={{ backgroundColor: row.color }}
                            aria-hidden="true"
                          />
                        )}
                        <span>{row.name || row.label || row.date}</span>
                      </th>
                      <td className="text-right font-mono font-bold">
                        {row.total !== undefined ? row.total : row.value !== undefined ? row.value : row.cantidad}
                      </td>
                      {tableHeaders.extra && (
                        <td className="text-right font-mono text-muted">
                          {row.percentage || '-'}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumen textual accesible */}
          <ChartSummary
            text={summaryText}
            extraNote={extraNote}
          />
        </>
      )}
    </article>
  )
}
