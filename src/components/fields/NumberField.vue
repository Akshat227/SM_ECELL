<script setup>
defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [Number, String], default: "" },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <input
    type="number"
    :placeholder="field.placeholder || ''"
    :required="field.required"
    :min="field.min"
    :max="field.max"
    :step="field.step || 'any'"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value === '' ? '' : Number($event.target.value))"
  />
</template>
