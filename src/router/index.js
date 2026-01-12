/**
 * Vue Router - Configuración de rutas
 * Define todas las rutas de la aplicación y protección de rutas autenticadas
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '@/stores/session.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ========================================
    // RUTAS PÚBLICAS
    // ========================================

    /**
     * Home - Página principal con menú
     */
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: 'BBTronic - Inicio'
      }
    },

    /**
     * Crear Sesión
     */
    {
      path: '/crear-sesion',
      name: 'crear-sesion',
      component: () => import('@/views/CrearSesionView.vue'),
      meta: {
        title: 'Crear Sesión - BBTronic'
      }
    },

    /**
     * Unirse a Sesión
     */
    {
      path: '/unirse-sesion',
      name: 'unirse-sesion',
      component: () => import('@/views/UnirseSesionView.vue'),
      meta: {
        title: 'Unirse a Sesión - BBTronic'
      }
    },

    // ========================================
    // RUTAS PROTEGIDAS (Requieren autenticación)
    // ========================================

    /**
     * Lobby - Sala de espera de sesión
     */
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('@/views/LobbyView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Lobby - BBTronic'
      }
    },

    // ========================================
    // JUEGOS
    // ========================================

    /**
     * Preguntas Directas - Enviar preguntas
     */
    {
      path: '/preguntas-directas',
      name: 'preguntas-directas',
      component: () => import('@/views/games/PreguntasDirectasView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Preguntas Directas - BBTronic'
      }
    },

    /**
     * Mostrar Preguntas - Ver y navegar preguntas
     */
    {
      path: '/mostrar-preguntas',
      name: 'mostrar-preguntas',
      component: () => import('@/views/games/MostrarPreguntasView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Mostrar Preguntas - BBTronic'
      }
    },

    /**
     * Preguntas Incómodas
     */
    {
      path: '/preguntas-incomodas',
      name: 'preguntas-incomodas',
      component: () => import('@/views/games/PreguntasIncomodasView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Preguntas Incómodas - BBTronic'
      }
    },

    /**
     * Yo Nunca Nunca
     */
    {
      path: '/yo-nunca-nunca',
      name: 'yo-nunca-nunca',
      component: () => import('@/views/games/YoNuncaNuncaView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Yo Nunca Nunca - BBTronic'
      }
    },

    /**
     * Quién Es Más Probable
     */
    {
      path: '/quien-es-mas-probable',
      name: 'quien-es-mas-probable',
      component: () => import('@/views/games/QuienEsMasProbableView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Quién Es Más Probable - BBTronic'
      }
    },

    /**
     * Cultura Pendeja
     */
    {
      path: '/cultura-pendeja',
      name: 'cultura-pendeja',
      component: () => import('@/views/games/CulturaPendejaView.vue'),
      meta: {
        requiresAuth: true,
        title: 'Cultura Pendeja - BBTronic'
      }
    },

    // ========================================
    // RUTA 404 - Not Found
    // ========================================

    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/'
    }
  ]
})

// ========================================
// NAVIGATION GUARD - Protección de rutas
// ========================================

router.beforeEach((to, from, next) => {
  const sessionStore = useSessionStore()

  // Actualizar título de la página
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Intentar restaurar sesión desde sessionStorage
    if (!sessionStore.isAuthenticated) {
      sessionStore.restoreSession()
    }

    // Si aún no está autenticado, redirigir a home
    if (!sessionStore.isAuthenticated) {
      console.warn('🔒 Ruta protegida, redirigiendo a home...')
      next({ name: 'home' })
      return
    }
  }

  // Continuar con la navegación
  next()
})

export default router
