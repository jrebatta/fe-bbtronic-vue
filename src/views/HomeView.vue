<template>
  <div class="home-view">
    <BackgroundVideo :low-opacity="false" />

    <!-- Contenedor principal -->
    <div class="wrapper">
      <div class="container">
        <!-- Contenedor de botones -->
        <div class="game-buttons-container">
          <router-link
            to="/crear-sesion"
            class="neon-button"
          >
            Crear una Sesión
          </router-link>

          <router-link
            to="/unirse-sesion"
            class="neon-button"
          >
            Unirse a una Sesión
          </router-link>

          <a
            href="#"
            class="neon-button"
            @click.prevent="jugarEnCasa"
          >
            Jugar en Casa
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * HomeView - Página principal
 * Migrado desde index.html y menu_juego.js
 */

import { useRouter } from 'vue-router'
import { BackgroundVideo } from '@/components/common'

const router = useRouter()

/**
 * Función para manejar "Jugar en Casa"
 * Por ahora redirige a home (funcionalidad futura)
 */
function jugarEnCasa() {
  // Aquí se puede implementar la funcionalidad de "Jugar en Casa"
  // Por ahora, simplemente mostramos un mensaje
  console.log('Jugar en Casa - Funcionalidad pendiente')

  // Opción: redirigir a alguna página específica
  // router.push('/jugar-casa')
}
</script>

<style scoped>
/* Contenedor principal de la vista */
.home-view {
  margin: 0;
  font-family: 'Roboto', sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #FFFFFF;
  overflow: hidden;
  background: linear-gradient(135deg, #0a0015 0%, #1a0033 50%, #2d0052 100%);
  position: relative;
}

/* Contenedor principal */
.wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  z-index: 1;
  padding: 20px;
  animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Contenedor de botones */
.game-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding: 40px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 25px;
  border: 1px solid rgba(187, 0, 255, 0.3);
  box-shadow: 0 8px 32px rgba(187, 0, 255, 0.2),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Botones estilo neón espacial */
.neon-button {
  font-size: 22px;
  color: #ffffff;
  text-decoration: none;
  font-weight: 600;
  letter-spacing: 1px;
  padding: 18px 40px;
  text-transform: uppercase;
  background: linear-gradient(135deg, rgba(187, 0, 255, 0.2) 0%, rgba(80, 0, 180, 0.2) 100%);
  border: 2px solid #bb00ff;
  border-radius: 15px;
  position: relative;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  text-shadow: 0 0 10px rgba(187, 0, 255, 0.8),
               0 0 20px rgba(187, 0, 255, 0.5);
  box-shadow: 0 4px 15px rgba(187, 0, 255, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
  display: block;
}

.neon-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.neon-button:hover::before {
  left: 100%;
}

/* Efecto hover para botones */
.neon-button:hover {
  background: linear-gradient(135deg, rgba(187, 0, 255, 0.4) 0%, rgba(80, 0, 180, 0.4) 100%);
  border-color: #ff00ff;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 8px 25px rgba(187, 0, 255, 0.6),
              0 0 40px rgba(187, 0, 255, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
  text-shadow: 0 0 15px rgba(255, 255, 255, 1),
               0 0 30px rgba(187, 0, 255, 1),
               0 0 45px rgba(187, 0, 255, 0.7);
}

.neon-button:active {
  transform: translateY(-1px) scale(0.98);
}

/* Responsive */
@media (max-width: 768px) {
  .game-buttons-container {
    padding: 30px 20px;
  }

  .neon-button {
    font-size: 18px;
    padding: 15px 30px;
  }
}
</style>
