<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const apiUrl = import.meta.env.VITE_API_URL;

interface Metrics {
  uptime: number;
  requestCount: number;
  errorCount: number;
  authFailures: number;
  webhookCount: number;
  avgResponseTime: number;
  errorRate: number;
}

const metrics = ref<Metrics | null>(null);
const loadingMetrics = ref(false);
const errorMetrics = ref<string | null>(null);
const aiAnalysis = ref<string | null>(null);
const loadingAi = ref(false);
const errorAi = ref<string | null>(null);
let pollingInterval: ReturnType<typeof setInterval> | null = null;

const formatUptime = (seconds: number): string => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min`;
  return `${seconds}s`;
};

const fetchMetrics = async () => {
  loadingMetrics.value = true;
  errorMetrics.value = null;
  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${apiUrl}/iot/metrics`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`Erreur ${response.status}`);
    const data = await response.json();
    metrics.value = data.data;
  } catch (err) {
    errorMetrics.value = err instanceof Error ? err.message : 'Erreur inconnue';
  } finally {
    loadingMetrics.value = false;
  }
};

const analyzeWithAI = async () => {
  if (!metrics.value) return;
  loadingAi.value = true;
  errorAi.value = null;
  aiAnalysis.value = null;

  try {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${apiUrl}/iot/analyze`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metrics: metrics.value }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    const data = await response.json();
    aiAnalysis.value = data.data.analysis;
  } catch (err) {
    errorAi.value = err instanceof Error ? err.message : 'Erreur inconnue';
  } finally {
    loadingAi.value = false;
  }
};

onMounted(() => {
  fetchMetrics();
  pollingInterval = setInterval(fetchMetrics, 30000);
});

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval);
});
</script>

<template>
  <div class="p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-primary">Monitoring IoT</h1>
      <button
        @click="fetchMetrics"
        :disabled="loadingMetrics"
        class="px-4 py-2 bg-accent text-white rounded hover:bg-accent/80 transition-colors disabled:opacity-50 text-sm"
        type="button"
      >
        {{ loadingMetrics ? 'Chargement...' : 'Actualiser' }}
      </button>
    </div>

    <div v-if="errorMetrics" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
      Erreur : {{ errorMetrics }}
    </div>

    <!-- Grille de métriques -->
    <div v-if="metrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Uptime -->
      <div class="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
        <p class="text-sm text-gray-500 mb-1">Uptime</p>
        <p class="text-2xl font-bold text-gray-800">{{ formatUptime(metrics.uptime) }}</p>
      </div>

      <!-- Requêtes totales -->
      <div class="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
        <p class="text-sm text-gray-500 mb-1">Requêtes totales</p>
        <p class="text-2xl font-bold text-gray-800">{{ metrics.requestCount }}</p>
      </div>

      <!-- Erreurs -->
      <div class="bg-white rounded-lg shadow p-5 border-l-4 border-gray-400">
        <p class="text-sm text-gray-500 mb-1">Erreurs</p>
        <p class="text-2xl font-bold text-gray-800">{{ metrics.errorCount }}</p>
      </div>

      <!-- Taux d'erreur — rouge si > 50% -->
      <div
        class="rounded-lg shadow p-5 border-l-4 transition-colors"
        :class="metrics.errorRate > 50
          ? 'bg-red-50 border-red-500'
          : 'bg-white border-orange-500'"
      >
        <p class="text-sm mb-1" :class="metrics.errorRate > 50 ? 'text-red-500' : 'text-gray-500'">
          Taux d'erreur
        </p>
        <p class="text-2xl font-bold" :class="metrics.errorRate > 50 ? 'text-red-700' : 'text-gray-800'">
          {{ metrics.errorRate }}%
        </p>
        <p v-if="metrics.errorRate > 50" class="text-xs text-red-500 mt-1 font-medium">⚠ Seuil critique dépassé</p>
      </div>

      <!-- Temps de réponse moyen -->
      <div class="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
        <p class="text-sm text-gray-500 mb-1">Temps de réponse moyen</p>
        <p class="text-2xl font-bold text-gray-800">{{ metrics.avgResponseTime }} ms</p>
      </div>

      <!-- Échecs d'authentification — rouge si > 5 -->
      <div
        class="rounded-lg shadow p-5 border-l-4 transition-colors"
        :class="metrics.authFailures > 5
          ? 'bg-red-50 border-red-500'
          : 'bg-white border-yellow-500'"
      >
        <p class="text-sm mb-1" :class="metrics.authFailures > 5 ? 'text-red-500' : 'text-gray-500'">
          Tentatives de connexion échouées
        </p>
        <p class="text-2xl font-bold" :class="metrics.authFailures > 5 ? 'text-red-700' : 'text-gray-800'">
          {{ metrics.authFailures }}
        </p>
        <p v-if="metrics.authFailures > 5" class="text-xs text-red-500 mt-1 font-medium">⚠ Activité suspecte détectée</p>
      </div>
    </div>

    <!-- Squelette de chargement -->
    <div v-else-if="loadingMetrics" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 6" :key="i" class="bg-white rounded-lg shadow p-5 animate-pulse">
        <div class="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
        <div class="h-7 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Section analyse IA -->
    <div v-if="metrics" class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800">Analyse IA</h2>
        <button
          @click="analyzeWithAI"
          :disabled="loadingAi"
          class="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors disabled:opacity-50 text-sm flex items-center gap-2"
          type="button"
        >
          <span
            v-if="loadingAi"
            class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          ></span>
          {{ loadingAi ? 'Analyse en cours...' : "Analyser avec l'IA" }}
        </button>
      </div>

      <div v-if="errorAi" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
        Erreur IA : {{ errorAi }}
      </div>

      <div
        v-if="aiAnalysis"
        class="bg-gray-50 rounded p-4 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed"
      >
        {{ aiAnalysis }}
      </div>

      <p v-if="!aiAnalysis && !loadingAi && !errorAi" class="text-sm text-gray-400 italic">
        Cliquez sur "Analyser avec l'IA" pour obtenir un diagnostic basé sur les métriques actuelles.
      </p>
    </div>
  </div>
</template>
