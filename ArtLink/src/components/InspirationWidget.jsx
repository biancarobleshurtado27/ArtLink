import { useState } from 'react'
import { Quote, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function InspirationWidget({ quote, onRefresh, loading }) {
  const [error, setError] = useState('')
  async function refresh() { setError(''); try { await onRefresh() } catch (requestError) { setError(requestError.message) } }
  return <aside className="inspiration-widget" aria-labelledby="inspiration-title"><div className="inspiration-heading"><Quote size={21} aria-hidden="true" /><h2 id="inspiration-title">Chispa del día</h2></div>{quote ? <><p>“{quote.quote}”</p><span>— {quote.author}</span></> : <p>Una frase para acompañar tu próximo proyecto.</p>}{error && <p className="form-message form-error" role="alert">{error}</p>}<Button variant="outline" loading={loading} onClick={refresh}><RefreshCw size={15} aria-hidden="true" /> Nueva frase</Button></aside>
}
