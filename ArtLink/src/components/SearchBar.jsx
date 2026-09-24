import { Search, SlidersHorizontal } from 'lucide-react'

export default function SearchBar({ value, onChange, onSubmit, onFilter, placeholder = 'Busca por estilo, disciplina o artista' }) {
  return <form className="search-row" onSubmit={(event) => { event.preventDefault(); onSubmit?.() }}><label className="search-bar"><Search size={19} aria-hidden="true" /><span className="sr-only">Buscar artistas</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>{onFilter && <button className="filter-button" type="button" onClick={onFilter}><SlidersHorizontal size={18} aria-hidden="true" /><span>Filtros</span></button>}</form>
}
