<template>
  <div class="phone-container relative mx-auto my-4 flex aspect-[9/19] w-full max-w-[320px] flex-col overflow-hidden rounded-[2rem] border-8 border-gray-800 bg-white text-sm text-gray-800 shadow-xl">
    
    <!-- Notch (刘海) -->
    <div class="absolute top-0 left-1/2 z-20 flex h-5 w-1/3 -translate-x-1/2 items-center justify-center rounded-b-xl bg-gray-800">
      <!-- Camera dot -->
      <div class="ml-4 h-2 w-2 rounded-full bg-gray-900"></div>
    </div>

    <!-- Top Status Bar (手机顶部状态) -->
    <div class="z-10 flex items-center justify-between border-b border-gray-200 bg-gray-100 px-4 pt-1 pb-2 text-xs font-semibold">
      <div>{{ currentTime }}</div>
      <div class="flex items-center space-x-1">
        <i class="fas fa-signal"></i>
        <i class="fas fa-wifi"></i>
        <i class="fas fa-battery-three-quarters"></i>
      </div>
    </div>

    <!-- Character Status Header (角色状态栏) -->
    <div class="flex items-center border-b border-gray-200 bg-blue-50 p-3">
      <div class="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-200 text-lg font-bold text-blue-500 shadow-inner">
        <i class="fas fa-user"></i>
      </div>
      <div class="flex-1">
        <div class="font-bold text-gray-800">Character Status</div>
        <div class="mt-1 flex space-x-2 text-xs text-gray-500">
          <span class="flex items-center"><i class="fas fa-heart mr-1 text-red-500"></i> {{ statusStore.status.hp }}</span>
          <span class="flex items-center"><i class="fas fa-star mr-1 text-yellow-500"></i> {{ statusStore.status.mp }}</span>
        </div>
      </div>
    </div>

    <!-- Status Details Area -->
    <div class="flex justify-around border-b border-gray-100 bg-white p-3 text-xs">
      <div class="flex flex-col items-center">
        <span class="text-gray-400">Mood</span>
        <span class="font-bold">{{ statusStore.status.mood }}</span>
      </div>
      <div class="flex flex-col items-center">
        <span class="text-gray-400">Location</span>
        <span class="font-bold">{{ statusStore.status.location }}</span>
      </div>
    </div>

    <!-- Chat Interface / Content Area -->
    <div class="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
      <div class="flex flex-col space-y-3">
        <!-- Message bubble 1 -->
        <div class="relative max-w-[80%] self-start rounded-xl rounded-tl-sm border border-gray-100 bg-white p-2 shadow-sm">
          <p class="text-gray-700">How are you feeling today?</p>
        </div>
        
        <!-- Message bubble 2 -->
        <div class="relative max-w-[80%] self-end rounded-xl rounded-tr-sm bg-blue-500 p-2 text-white shadow-sm">
          <p>Status updated.</p>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="flex items-center justify-between border-t border-gray-200 bg-white p-3">
      <button class="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-500 transition hover:bg-red-200" @click="heal">
        <i class="fas fa-plus"></i>
      </button>
      <div class="mx-2 flex-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-400">
        System is running...
      </div>
      <button class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500 transition hover:bg-blue-200" @click="changeLocation">
        <i class="fas fa-map-marker-alt"></i>
      </button>
    </div>

    <!-- Home Indicator -->
    <div class="mx-auto my-1 h-1 w-1/3 rounded-full bg-gray-300"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useStatusStore } from './store';

const statusStore = useStatusStore();
const currentTime = ref('');
let timer: number;

const updateTime = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

const heal = () => {
  statusStore.status.hp = Math.min(statusStore.status.hp + 10, 100);
};

const changeLocation = () => {
  const locations = ['Home', 'City', 'Forest', 'School', 'Tavern'];
  const currentIndex = locations.indexOf(statusStore.status.location);
  statusStore.status.location = locations[(currentIndex + 1) % locations.length];
};
</script>

<style scoped>
/* Scoped styles to ensure isolated look, avoiding affecting host but Tailwind handles most */
.phone-container {
  box-sizing: border-box;
}
/* Custom scrollbar for chat area */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
</style>