<template>
  <div class="home-view">
    <BackgroundVideo />

    <!-- Noise overlay for texture -->
    <div class="noise-overlay" aria-hidden="true"></div>

    <div class="home-wrapper">
      <!-- Brand header -->
      <div class="brand-header">
        <div class="brand-logo-mark" aria-hidden="true">
          <span class="logo-icon">🍺</span>
        </div>
        <h1 class="brand-name">BBTronic</h1>
        <p class="brand-tagline">Los mejores juegos de bebidas</p>
      </div>

      <!-- Action cards -->
      <div class="action-grid">
        <router-link to="/crear-sesion" class="action-card card-create">
          <div class="card-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div class="card-body">
            <span class="card-title">Crear Sesión</span>
            <span class="card-sub">Inicia una nueva sala</span>
          </div>
          <div class="card-arrow" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </router-link>

        <router-link to="/unirse-sesion" class="action-card card-join">
          <div class="card-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10 17 15 12 10 7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
          </div>
          <div class="card-body">
            <span class="card-title">Unirse</span>
            <span class="card-sub">Entra con un código</span>
          </div>
          <div class="card-arrow" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>
        </router-link>

        <button class="action-card card-local" @click="jugarEnCasa">
          <div class="card-icon" aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <div class="card-body">
            <span class="card-title">Jugar en Casa</span>
            <span class="card-sub">Sin conexión</span>
          </div>
          <div class="card-badge" aria-label="Próximamente">Pronto</div>
        </button>
      </div>

      <!-- Footer hint -->
      <p class="home-footer">Hasta 10 jugadores &middot; 5 modos de juego</p>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { BackgroundVideo } from '@/components/common'

const router = useRouter()

function jugarEnCasa() {
  console.log('Jugar en Casa - Funcionalidad pendiente')
}
</script>

<style scoped>
.home-view {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Subtle dark noise/texture overlay */
.noise-overlay {
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  z-index: 0;
  pointer-events: none;
}

.home-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  animation: fadeInUp 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Brand ── */
.brand-header {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.brand-logo-mark {
  width: 72px;
  height: 72px;
  background: rgba(187, 0, 255, 0.12);
  border: 1.5px solid rgba(187, 0, 255, 0.35);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34px;
  box-shadow: 0 0 28px rgba(187, 0, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.08);
}

.brand-name {
  font-family: 'Righteous', sans-serif;
  font-size: 48px;
  font-weight: 400;
  color: #f0e6ff;
  letter-spacing: 2px;
  animation: neonPulse 3s ease-in-out infinite;
  line-height: 1;
}

@keyframes neonPulse {
  0%, 100% { text-shadow: 0 0 20px rgba(187,0,255,0.9), 0 0 40px rgba(187,0,255,0.5); }
  50%       { text-shadow: 0 0 30px rgba(187,0,255,1),   0 0 60px rgba(187,0,255,0.7), 0 0 90px rgba(187,0,255,0.3); }
}

.brand-tagline {
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: rgba(240, 230, 255, 0.55);
  letter-spacing: 0.5px;
}

/* ── Action grid ── */
.action-grid {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 18px 20px;
  background: rgba(12, 10, 30, 0.72);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(187, 0, 255, 0.25);
  border-radius: 16px;
  text-decoration: none;
  color: #f0e6ff;
  cursor: pointer;
  font-family: 'Poppins', sans-serif;
  transition: all 250ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  position: relative;
  overflow: hidden;
  text-align: left;
}

/* Hover glow line on left edge */
.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background: #bb00ff;
  transform: scaleY(0);
  transform-origin: center;
  transition: transform 250ms ease;
  border-radius: 0 2px 2px 0;
}

.action-card:hover {
  background: rgba(20, 14, 45, 0.85);
  border-color: rgba(187, 0, 255, 0.5);
  transform: translateX(4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(187, 0, 255, 0.15);
}

.action-card:hover::before {
  transform: scaleY(1);
}

.action-card:active {
  transform: translateX(2px) scale(0.99);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-create .card-icon {
  background: rgba(187, 0, 255, 0.15);
  border: 1px solid rgba(187, 0, 255, 0.3);
  color: #cc44ff;
}

.card-join .card-icon {
  background: rgba(46, 213, 115, 0.12);
  border: 1px solid rgba(46, 213, 115, 0.3);
  color: #2ed573;
}

.card-local .card-icon {
  background: rgba(255, 165, 2, 0.12);
  border: 1px solid rgba(255, 165, 2, 0.25);
  color: #ffa502;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #f0e6ff;
  letter-spacing: 0.2px;
}

.card-sub {
  font-size: 12px;
  color: rgba(240, 230, 255, 0.5);
  font-weight: 400;
}

.card-arrow {
  color: rgba(240, 230, 255, 0.35);
  transition: color 200ms ease, transform 200ms ease;
  flex-shrink: 0;
}
.action-card:hover .card-arrow {
  color: #bb00ff;
  transform: translateX(3px);
}

.card-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 3px 8px;
  background: rgba(255, 165, 2, 0.15);
  border: 1px solid rgba(255, 165, 2, 0.35);
  border-radius: 20px;
  color: #ffa502;
  flex-shrink: 0;
}

.card-local {
  opacity: 0.7;
}

/* ── Footer ── */
.home-footer {
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: rgba(240, 230, 255, 0.3);
  letter-spacing: 0.3px;
}

/* ── Responsive ── */
@media (max-width: 480px) {
  .brand-name {
    font-size: 40px;
  }

  .home-wrapper {
    gap: 24px;
  }
}
</style>
