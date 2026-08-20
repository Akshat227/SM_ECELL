<script setup>
defineProps({
  field: { type: Object, required: true },
  modelValue: { type: String, default: "" },
});
defineEmits(["update:modelValue"]);
</script>

<template>
  <textarea
    :placeholder="field.placeholder || ''"
    :required="field.required"
    :value="modelValue"
    rows="3"
    @input="$emit('update:modelValue', $event.target.value)"
  ></textarea>
</template>
