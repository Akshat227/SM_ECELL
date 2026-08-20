<script setup>
import { reactive, ref, onMounted } from "vue";
import { api } from "../api/client.js";
import DynamicField from "./DynamicField.vue";

const fields = ref([]);
const loading = ref(true);
const fetchError = ref("");

const formData = reactive({});
const status = reactive({ submitting: false, message: "", success: false });
const showToast = ref(false);

async function loadSchema() {
  loading.value = true;
  fetchError.value = "";
  try {
    fields.value = await api.getSchema();
    initFormData();
  } catch (err) {
    fetchError.value = err.message || "Failed to load form fields.";
  } finally {
    loading.value = false;
  }
}

function initFormData() {
  for (const key of Object.keys(formData)) delete formData[key];
  for (const f of fields.value) {
    formData[f.id] = f.type === "checkbox" ? false : "";
  }
}

async function handleSubmit() {
  status.submitting = true;
  status.message = "";
  showToast.value = false;

  try {
    const res = await api.submit(formData);
    status.success = true;
    status.message = res.message || "Submission received! Thank you.";
    initFormData();
  } catch (err) {
    status.success = false;
    status.message = err.message || "Failed to submit. Please try again.";
  } finally {
    status.submitting = false;
    showToast.value = true;
    setTimeout(() => (showToast.value = false), 3500);
  }
}

onMounted(() => {
  loadSchema();
});
</script>

<template>
  <div v-if="loading" class="form-loading">
    <div class="spinner"></div>
    <p>Loading form…</p>
  </div>

  <div v-else-if="fetchError" class="form-error">
    <p>{{ fetchError }}</p>
    <button class="btn-retry" @click="loadSchema">Retry</button>
  </div>

  <form v-else class="dynamic-form" @submit.prevent="handleSubmit" autocomplete="off">
    <DynamicField
      v-for="f in fields"
      :key="f.id"
      :field="f"
      v-model="formData[f.id]"
    />

    <div class="form-actions">
      <button type="submit" class="btn-submit" :disabled="status.submitting">
        <span class="btn-text">{{ status.submitting ? "Submitting…" : "Submit" }}</span>
        <span class="btn-icon">→</span>
      </button>
    </div>
  </form>

  <!-- Toast notification for attendee -->
  <Transition name="toast">
    <div
      v-if="showToast"
      class="toast"
      :class="status.success ? 'toast--ok' : 'toast--err'"
    >
      {{ status.message }}
    </div>
  </Transition>
</template>
