<script setup>
defineProps({
  field: { type: Object, required: true },
  modelValue: { type: String, default: "" },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <select
    :required="field.required"
    :value="modelValue"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option value="" disabled>Select…</option>
    <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
  </select>
</template>
