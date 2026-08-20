<script setup>
import DynamicForm from "./components/DynamicForm.vue";
</script>

<template>
  <div class="app">
    <!-- Ambient background glow -->
    <div class="bg-glow"></div>

    <header class="app-header">
      <div class="logo-mark">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 9h18" />
          <path d="M3 15h18" />
          <path d="M9 3v18" />
          <path d="M15 3v18" />
        </svg>
      </div>
      <div>
        <h1>E-Cell</h1>
        <p class="subtitle">Submission Form</p>
      </div>
    </header>

    <main class="card">
      <DynamicForm />
    </main>

    <footer class="app-footer">
      <p>E-Cell • Submission Form</p>
    </footer>
  </div>
</template>
