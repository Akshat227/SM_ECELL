<script setup>
defineProps({
  field: { type: Object, required: true },
  modelValue: { type: [String, Number], default: "" },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <input
    :type="field.type"
    :placeholder="field.placeholder || ''"
    :required="field.required"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
