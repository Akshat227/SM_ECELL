<script setup>
defineProps({
  field: { type: Object, required: true },
  modelValue: { type: Boolean, default: false },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <label class="checkbox-toggle" :for="field.id + '_cb'">
    <input
      :id="field.id + '_cb'"
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span class="toggle-track">
      <span class="toggle-thumb"></span>
    </span>
  </label>
</template>
