/**
 * fieldRegistry.js — Maps field schema "type" strings to Vue components.
 *
 * To add a new field type:
 *   1. Create  fields/YourField.vue  (same props/emit contract)
 *   2. Add one line below
 *   3. Done — nothing else in the app needs to change.
 */
import TextField from "./fields/TextField.vue";
import TextareaField from "./fields/TextareaField.vue";
import NumberField from "./fields/NumberField.vue";
import SelectField from "./fields/SelectField.vue";
import CheckboxField from "./fields/CheckboxField.vue";
import DateField from "./fields/DateField.vue";

export const fieldRegistry = {
  text: TextField,
  email: TextField,
  tel: TextField,
  url: TextField,
  password: TextField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  checkbox: CheckboxField,
  date: DateField,
};

export function resolveFieldComponent(type) {
  return fieldRegistry[type] || TextField;
}
