import { Search, SlidersHorizontal } from 'lucide-react'

export default function SearchBar({ value, onChange, onFilter, placeholder = 'Busca por estilo, disciplina o artista' }) {
  return <div className="search-row"><label className="search-bar"><Search size={19} aria-hidden="true" /><span className="sr-only">Buscar artistas</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>{onFilter && <button className="filter-button" type="button" onClick={onFilter}><SlidersHorizontal size={18} aria-hidden="true" /><span>Filtros</span></button>}</div>
}
