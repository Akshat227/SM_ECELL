<script setup>
import { resolveFieldComponent } from "./fieldRegistry";

defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number, Boolean], default: "" },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="field" :class="{ 'field--checkbox': field.type === 'checkbox' }">
    <label :for="field.id">
      {{ field.label }}<span v-if="field.required" class="req">*</span>
    </label>
    <component
      :is="resolveFieldComponent(field.type)"
      :id="field.id"
      :field="field"
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
    />
  </div>
</template>
