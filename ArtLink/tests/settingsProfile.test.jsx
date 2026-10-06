import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import ProfileSettingsSection from '../src/components/settings/ProfileSettingsSection'
import SettingsPage from '../src/pages/SettingsPage'
import SettingsProfilePage from '../src/pages/SettingsProfilePage'
import * as userService from '../src/services/userService'
import * as artistService from '../src/services/artistService'
import { AuthContext } from '../src/context/context'
import { SettingsProvider } from '../src/context/SettingsContext'

const mockClientUser = {
  id: 'client-1',
  name: 'Valeria Castro',
  email: 'valeria@artlink.test',
  role: 'cliente',
  avatar: 'https://ui-avatars.com/api/?name=Valeria',
  bio: 'Coleccionista de arte conceptual y aficionada a la ilustración digital.',
  phone: '+52 55 9876 5432',
  location: 'Guadalajara, México',
  website: 'https://valeria.art',
}

const mockArtistUser = {
  id: 'artist-user-1',
  name: 'Mateo Ríos',
  email: 'mateo@artlink.demo',
  role: 'artista',
  avatar: '/images/hero/thumbs/sora-2.jpg',
  bio: 'Ilustrador 2D y diseñador de personajes.',
  location: 'Bogotá, Colombia',
  artistProfileId: 'artist-001',
}

const mockArtistProfile = {
  id: 'artist-001',
  userId: 'artist-user-1',
  displayName: 'Mateo Studio',
  username: 'mateo_rios',
  disciplines: ['Ilustración Digital', 'Concept Art'],
  styles: ['Anime', 'Fantasía'],
  basePrice: 120,
  availability: 'open',
  slots: 4,
  socialLinks: {
    web: 'https://mateo.art',
    x: '@mateo_art',
    instagram: '@mateo.draws',
  },
}

describe('ProfileSettingsSection - Modificación de Perfil', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(userService, 'getUserById').mockResolvedValue(mockClientUser)
    vi.spyOn(userService, 'updateUser').mockResolvedValue({ ...mockClientUser, name: 'Valeria Actualizada' })
    vi.spyOn(artistService, 'getArtistByUserId').mockResolvedValue([mockArtistProfile])
    vi.spyOn(artistService, 'updateArtist').mockResolvedValue({ ...mockArtistProfile, basePrice: 150 })
  })

  it('renderiza la información real del cliente autenticado y permite actualizarla', async () => {
    const mockUpdateUser = vi.fn()

    render(
      <AuthContext.Provider value={{ user: mockClientUser, updateUser: mockUpdateUser }}>
        <MemoryRouter>
          <ProfileSettingsSection />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    // Esperar a que cargue la información
    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre completo \/ para mostrar/i)).toHaveValue('Valeria Castro')
    })

    expect(screen.getByLabelText(/Correo electrónico/i)).toHaveValue('valeria@artlink.test')
    expect(screen.getByLabelText(/Biografía y descripción personal/i)).toHaveValue(mockClientUser.bio)
    expect(screen.getByLabelText(/Ubicación o ciudad/i)).toHaveValue('Guadalajara, México')

    // Modificar nombre
    const nameInput = screen.getByLabelText(/Nombre completo \/ para mostrar/i)
    fireEvent.change(nameInput, { target: { value: 'Valeria Robles' } })

    // Guardar cambios
    const saveBtn = screen.getByRole('button', { name: /Guardar cambios de perfil/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalledWith('client-1', expect.objectContaining({
        name: 'Valeria Robles',
        email: 'valeria@artlink.test',
      }))
      expect(mockUpdateUser).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Valeria Robles',
      }))
      expect(screen.getByText(/Tu perfil ha sido actualizado y guardado correctamente/i)).toBeInTheDocument()
    })
  })

  it('muestra campos adicionales y permite editar datos artísticos para usuarios con rol de artista', async () => {
    const mockUpdateUser = vi.fn()

    render(
      <AuthContext.Provider value={{ user: mockArtistUser, updateUser: mockUpdateUser }}>
        <MemoryRouter>
          <ProfileSettingsSection />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByText(/Configuración de Artista y Catálogo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Nombre artístico público/i)).toHaveValue('Mateo Studio')
    })

    expect(screen.getByLabelText(/Handle de creador/i)).toHaveValue('mateo_rios')
    expect(screen.getByLabelText(/Tarifa base inicial/i)).toHaveValue(120)
    expect(screen.getByLabelText(/Cupos disponibles de comisiones/i)).toHaveValue(4)

    // Modificar tarifa base y nombre artístico
    const priceInput = screen.getByLabelText(/Tarifa base inicial/i)
    fireEvent.change(priceInput, { target: { value: '150' } })

    const saveBtn = screen.getByRole('button', { name: /Guardar cambios de perfil/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(artistService.updateArtist).toHaveBeenCalledWith('artist-001', expect.objectContaining({
        basePrice: 150,
      }))
      expect(screen.getByText(/Tu perfil ha sido actualizado y guardado correctamente/i)).toBeInTheDocument()
    })
  })

  it('valida que el nombre no esté vacío al guardar', async () => {
    render(
      <AuthContext.Provider value={{ user: mockClientUser, updateUser: vi.fn() }}>
        <MemoryRouter>
          <ProfileSettingsSection />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre completo \/ para mostrar/i)).toHaveValue('Valeria Castro')
    })

    const nameInput = screen.getByLabelText(/Nombre completo \/ para mostrar/i)
    fireEvent.change(nameInput, { target: { value: '' } })

    const saveBtn = screen.getByRole('button', { name: /Guardar cambios de perfil/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(screen.getByText(/El nombre para mostrar es obligatorio/i)).toBeInTheDocument()
      expect(userService.updateUser).not.toHaveBeenCalled()
    })
  })

  it('no ofrece avatares sugeridos ni campos de URL: solo un input real de archivos', async () => {
    render(
      <AuthContext.Provider value={{ user: mockClientUser, updateUser: vi.fn() }}>
        <MemoryRouter>
          <ProfileSettingsSection />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre completo \/ para mostrar/i)).toHaveValue('Valeria Castro')
    })

    expect(screen.queryByRole('button', { name: /Sora Moon/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/URL de la imagen de avatar/i)).not.toBeInTheDocument()
    expect(screen.queryByPlaceholderText(/https:\/\/ejemplo.com\/mi-avatar.jpg/i)).not.toBeInTheDocument()

    // El input real de archivos está disponible para foto de perfil y portada.
    const avatarInput = screen.getByLabelText(/Foto de perfil: seleccionar archivo de imagen/i)
    const bannerInput = screen.getByLabelText(/Portada de perfil: seleccionar archivo de imagen/i)

    expect(avatarInput).toHaveAttribute('type', 'file')
    expect(bannerInput).toHaveAttribute('type', 'file')
    expect(avatarInput.getAttribute('accept')).toContain('image/')
  })

  it('guarda la imagen elegida por el usuario desde su dispositivo como Data URL', async () => {
    render(
      <AuthContext.Provider value={{ user: mockClientUser, updateUser: vi.fn() }}>
        <MemoryRouter>
          <ProfileSettingsSection />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre completo \/ para mostrar/i)).toHaveValue('Valeria Castro')
    })

    // Archivo real de imagen (bytes PNG) tal como lo entrega el dispositivo.
    const chosenFile = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], 'mi-foto.png', {
      type: 'image/png',
    })

    fireEvent.change(screen.getByLabelText(/Foto de perfil: seleccionar archivo de imagen/i), {
      target: { files: [chosenFile] },
    })

    await waitFor(() => {
      expect(screen.getByText(/Archivo seleccionado: mi-foto.png/i)).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Guardar cambios de perfil/i }))

    await waitFor(() => {
      expect(userService.updateUser).toHaveBeenCalled()
    })

    const [, savedPayload] = userService.updateUser.mock.calls.at(-1)

    // Se persiste el archivo elegido por el usuario como Data URL, no una imagen generada ni de stock.
    expect(savedPayload.avatar).toMatch(/^data:image\/png;base64,/)
    expect(savedPayload.avatarUrl).toBe(savedPayload.avatar)
    expect(savedPayload.banner).toBe('')
  })

  it('rechaza archivos que no son imágenes', async () => {
    render(
      <AuthContext.Provider value={{ user: mockClientUser, updateUser: vi.fn() }}>
        <MemoryRouter>
          <ProfileSettingsSection />
        </MemoryRouter>
      </AuthContext.Provider>
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Nombre completo \/ para mostrar/i)).toHaveValue('Valeria Castro')
    })

    const notAnImage = new File(['contenido'], 'documento.pdf', { type: 'application/pdf' })

    fireEvent.change(screen.getByLabelText(/Foto de perfil: seleccionar archivo de imagen/i), {
      target: { files: [notAnImage] },
    })

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/debe ser una imagen JPG, PNG, WebP o GIF/i)
    })
  })
})

describe('Integración de ruta /settings/profile en SettingsPage', () => {
  it('SettingsPage activa por defecto la pestaña de perfil cuando la ruta es /settings/profile', async () => {
    render(
      <SettingsProvider>
        <AuthContext.Provider value={{ user: mockClientUser, updateUser: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter initialEntries={['/settings/profile']}>
            <Routes>
              <Route path="/settings/profile" element={<SettingsProfilePage />} />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </SettingsProvider>
    )

    const tabBtn = screen.getByRole('tab', { name: /Mi perfil/i })
    expect(tabBtn).toHaveClass('is-active')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Modificar perfil/i })).toBeInTheDocument()
    })
  })

  it('permite alternar entre Mi perfil y otras pestañas de Ajustes', async () => {
    render(
      <SettingsProvider>
        <AuthContext.Provider value={{ user: mockClientUser, updateUser: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter initialEntries={['/ajustes']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </SettingsProvider>
    )

    // Clic en pestaña Apariencia
    const aparienciaTab = screen.getByRole('tab', { name: /Apariencia/i })
    fireEvent.click(aparienciaTab)
    expect(aparienciaTab).toHaveClass('is-active')
    expect(screen.getByRole('heading', { name: /Apariencia y visualización/i })).toBeInTheDocument()

    // Clic en pestaña Mi perfil
    const perfilTab = screen.getByRole('tab', { name: /Mi perfil/i })
    fireEvent.click(perfilTab)
    expect(perfilTab).toHaveClass('is-active')
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Modificar perfil/i })).toBeInTheDocument()
    })
  })

  it('adapta el contenido para clientes sin mostrar TALLER EN VIVO ni normas de encargo de artista', async () => {
    render(
      <SettingsProvider>
        <AuthContext.Provider value={{ user: mockClientUser, updateUser: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter initialEntries={['/ajustes']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </SettingsProvider>
    )

    // Verifica encabezado de cliente
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Ajustes y Preferencias de Cliente/i })).toBeInTheDocument()
    })

    // No debe contener secciones exclusivas de taller de artista
    expect(screen.queryByText(/TALLER EN VIVO/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Disponibilidad & Normas de Encargo/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/PORTADA DEL ESTUDIO/i)).not.toBeInTheDocument()

    // El cliente también puede elegir portada y foto de perfil con archivos reales.
    expect(
      screen.getByLabelText(/Portada: seleccionar archivo de imagen/i)
    ).toHaveAttribute('type', 'file')
    expect(
      screen.getByLabelText(/Foto de perfil: seleccionar archivo de imagen/i)
    ).toHaveAttribute('type', 'file')

    // Debe contener secciones correspondientes a clientes
    expect(screen.getByRole('heading', { name: /Preferencias de Búsqueda y Encargos/i })).toBeInTheDocument()
  })

  it('muestra secciones completas de taller exclusivamente cuando el usuario es artista', async () => {
    render(
      <SettingsProvider>
        <AuthContext.Provider value={{ user: mockArtistUser, updateUser: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter initialEntries={['/ajustes']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </SettingsProvider>
    )

    // Verifica encabezado de taller
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Ajustes de Cuenta y Taller/i })).toBeInTheDocument()
    })

    // Debe contener las opciones de taller
    expect(screen.getByText(/TALLER EN VIVO/i)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Disponibilidad & Normas de Encargo/i })).toBeInTheDocument()
  })

  it('muestra opciones administrativas cuando el usuario es administrador', async () => {
    const mockAdminUser = {
      id: 'admin-user-1',
      name: 'Admin Central',
      email: 'admin@artlink.test',
      role: 'administrador',
    }

    render(
      <SettingsProvider>
        <AuthContext.Provider value={{ user: mockAdminUser, updateUser: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter initialEntries={['/ajustes']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </SettingsProvider>
    )

    // Verifica encabezado de administración
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Ajustes de Administración y Plataforma/i })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /Consola de Control del Sistema/i })).toBeInTheDocument()
    })

    // No debe contener taller en vivo
    expect(screen.queryByText(/TALLER EN VIVO/i)).not.toBeInTheDocument()
  })

  it('restringe la página a funciones de apariencia y accesibilidad cuando no hay sesión iniciada', async () => {
    render(
      <SettingsProvider>
        <AuthContext.Provider value={{ user: null, updateUser: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter initialEntries={['/ajustes']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </SettingsProvider>
    )

    // Verifica encabezado de invitado
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Entorno Visual & Accesibilidad/i })).toBeInTheDocument()
    })

    // Debe mostrar la insignia de Modo Visitante
    expect(screen.getByText(/MODO VISITANTE • CONFIGURACIÓN LOCAL/i)).toBeInTheDocument()
    expect(screen.getByText(/ACCESO PÚBLICO/i)).toBeInTheDocument()

    // Debe mostrar el banner informativo con enlaces a inicio de sesión y registro
    expect(screen.getByText(/Preferencias de Pantalla, Daltonismo y Accesibilidad/i)).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Iniciar sesión/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Crear cuenta/i }).length).toBeGreaterThan(0)

    // NO debe renderizar secciones de edición de perfil ni taller ni administración
    expect(screen.queryByRole('heading', { name: /Modificar perfil/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Identidad y Vitrina Pública/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Perfil y Datos de Cuenta/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: /Consola de Control del Sistema/i })).not.toBeInTheDocument()
    expect(screen.queryByText(/TALLER EN VIVO/i)).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Guardar cambios de perfil/i })).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Foto de perfil: seleccionar archivo de imagen/i)).not.toBeInTheDocument()

    // SÍ debe mostrar las herramientas de accesibilidad y visualización
    expect(screen.getByRole('heading', { name: /Apariencia y visualización/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tema Claro/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Tema Oscuro/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/Tamaño de texto/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Nivel de contraste/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Filtro de Daltonismo/i)).toBeInTheDocument()

    // La navegación lateral solo contiene las pestañas de entorno y accesibilidad
    expect(screen.getByRole('tab', { name: /Tema & Entorno Visual/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Filtros de Daltonismo/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Lectura & Accesibilidad/i })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Mi perfil/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: /Seguridad & Acceso/i })).not.toBeInTheDocument()
  })

  it('activa la pestaña de apariencia por defecto para visitantes sin cuenta', async () => {
    render(
      <SettingsProvider>
        <AuthContext.Provider value={{ user: null, updateUser: vi.fn(), logout: vi.fn() }}>
          <MemoryRouter initialEntries={['/ajustes']}>
            <SettingsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </SettingsProvider>
    )

    const temaTab = screen.getByRole('tab', { name: /Tema & Entorno Visual/i })
    expect(temaTab).toHaveClass('is-active')
  })
})
