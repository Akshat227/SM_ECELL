<script setup>
defineProps({
  field: { type: Object, required: true },
  modelValue: { type: String, default: "" },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <input
    type="date"
    :required="field.required"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
