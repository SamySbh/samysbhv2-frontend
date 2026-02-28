import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { title: 'Accueil' }
  },
  {
    path: '/services',
    name: 'services',
    component: () => import('@/views/Services.vue'),
    meta: { title: 'Mes Services' }
  },
  {
    path: '/contact',
    name: 'contact',
    component: () => import('@/views/Contact.vue'),
    meta: { title: 'Contact' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Page Non Trouvée' }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue'),
    meta: { title: 'Connexion' },
    beforeEnter: (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
      const authStore = useAuthStore()
      if (authStore.isAuthenticated) {
        // Rediriger en fonction du rôle
        if (authStore.currentUser?.role === 'ADMIN') {
          next('/admin')
        } else {
          next('/user')
        }
      } else {
        next()
      }
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/Register.vue'),
    meta: { title: 'Inscription' }
  },
  {
    path: '/user',
    name: 'UserDashboard',
    component: () => import('@/views/UserDashboard.vue'),
    meta: { requiresAuth: true, title: 'Tableau de bord' }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { requiresAdmin: true, requiresAuth: true, title: 'Administration' }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/Checkout.vue'),
    meta: { title: 'Validation du panier' }
  },
  {
    path: '/demande-projet',
    name: 'project-request',
    component: () => import('@/views/ProjectRequest.vue'),
    meta: { title: 'Demande de devis' }
  },
  {
    path: '/demande-projet/:id/confirmation',
    name: 'project-request-confirmation',
    component: () => import('@/views/ProjectRequestConfirmation.vue'),
    meta: { title: 'Demande confirmée' }
  },
  {
    path: '/mes-commandes',
    name: 'my-orders',
    component: () => import('@/views/MyOrders.vue'),
    meta: { requiresAuth: true, title: 'Mes commandes' }
  },
  {
    path: '/commande/:id',
    name: 'order-page',
    component: () => import('@/views/OrderPage.vue'),
    meta: { title: 'Ma commande', requiresAuth: true }
  },
  {
    path: '/commande/:id/paiement-confirme',
    name: 'payment-success',
    component: () => import('@/views/PaymentSuccess.vue'),
    meta: { title: 'Paiement confirmé' }
  },
  {
    path: '/commande/:id/paiement-annule',
    name: 'payment-cancel',
    component: () => import('@/views/PaymentCancel.vue'),
    meta: { title: 'Paiement annulé' }
  },
  {
    path: '/mentions-legales',
    name: 'TermsOfUse',
    component: () => import('@/views/TermsOfUse.vue'),
    props: (route: RouteLocationNormalized) => ({ sessionId: route.query.session_id }),
    meta: { title: 'Mentions légales' }
  },
  {
    path: '/politique-confidentialite',
    name: 'PrivacyPolicy',
    component: () => import('@/views/PrivacyPolicy.vue'),
    props: (route: RouteLocationNormalized) => ({ sessionId: route.query.session_id }),
    meta: { title: 'Politique de confidentialité' }
  },
  {
    path: '/cgv',
    name: 'TermsAndConditions',
    component: () => import('@/views/TermsAndConditions.vue'),
    meta: { title: 'Conditions générales de ventes' }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || ''),
  routes,
  // Comportement du scroll à chaque changement de route
  scrollBehavior() {
    return { top: 0 }
  }
})

// Middlewares
router.beforeEach(async (to, _from) => {
  document.title = to.meta?.title ? `SamySBH | ${to.meta.title}` : 'SamySBH'

  const authStore = useAuthStore()
  const token = localStorage.getItem("accessToken")

  // Si l'utilisateur est déjà authentifié selon le store mais que nous n'avons pas encore
  // ses données, les récupérer
  if (token && !authStore.currentUser) {
    try {
      await authStore.checkAuth()
    } catch (error) {
      console.error("Erreur de vérification d'authentification:", error)
      // Continuer même en cas d'erreur, la redirection sera gérée ci-dessous
    }
  }

  // Vérifier l'authentification si la route le requiert
  if (to.meta.requiresAuth && !token) {
    return '/login'
  }

  // Vérifier le rôle admin si nécessaire
  if (to.meta.requiresAdmin && authStore.currentUser?.role !== 'ADMIN') {
    // Rediriger vers le dashboard utilisateur si l'utilisateur est connecté mais pas admin
    if (authStore.isAuthenticated) {
      return '/user'
    }
    // Sinon, rediriger vers la page de connexion
    return '/login'
  }

  return true
})

export default router