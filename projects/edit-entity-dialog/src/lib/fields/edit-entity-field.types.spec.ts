import { EditEntityField, EditEntityRecord } from "../edit-entity-dialog.types";
import {
  TextFormField,
  SelectFormField,
  AutocompleteFormField,
  AutocompleteFormFieldService,
  DateFormField,
  DurationFormField,
} from "./edit-entity-field.types";
interface RecordValue extends EditEntityRecord {
  name: string;
}
interface SearchValue {
  _id: string;
  name: string;
}
// These assignments verify specialized callbacks remain usable as generic field configurations.
const text: TextFormField<RecordValue> = {
  kind: "text",
  name: "name",
  label: "Name",
  onValueChanges: (value) => {
    value.toUpperCase();
  },
};
const select: SelectFormField<RecordValue, SearchValue> = {
  kind: "select",
  name: "selection",
  label: "Selection",
  options: [
    {
      name: "One",
      value: { _id: "1", name: "One" },
      disabled: true,
      group: "Group",
    },
  ],
  open: (value) => {
    value._id;
  },
};
const selectMultiple: SelectFormField<RecordValue, SearchValue> = {
  kind: "select",
  name: "selections",
  label: "Selections",
  multiple: true,
  options: [{ name: "One", value: { _id: "1", name: "One" } }],
  defaultValue: [{ _id: "1", name: "One" }],
  onValueChanges: (value) => {
    const ids: string[] = value.map((option) => option._id);
    void ids;
  },
  unique: async (value) => value.every((option) => !!option._id),
};
const selectSingle: SelectFormField<RecordValue, SearchValue> = {
  kind: "select",
  name: "single",
  label: "Single",
  multiple: false,
  options: [],
  defaultValue: { _id: "1", name: "One" },
  onValueChanges: (value) => {
    const id: string = value._id;
    void id;
  },
  unique: async (value) => !!value._id,
};
const runtimeMultiple: boolean = Math.random() > 0.5;
const sourceBroadSelect: SelectFormField<RecordValue> = {
  kind: "select",
  name: "legacy",
  label: "Legacy",
  multiple: runtimeMultiple,
  options: [],
  defaultValue: [],
  onValueChanges: (value) => {
    void value;
  },
};
const service: AutocompleteFormFieldService<RecordValue, SearchValue> = {
  display: (value) => ({ name: value.name }),
  search: async (_limit, _skip, _search, _record, _form, _selected) => ({
    data: [],
    matchCount: 0,
  }),
  group: (value) => value.name,
  open: (value) => {
    value._id;
  },
};
const autocomplete: AutocompleteFormField<RecordValue, SearchValue> = {
  kind: "autocomplete",
  name: "search",
  label: "Search",
  service,
};
const date: DateFormField<RecordValue> = {
  kind: "date",
  name: "date",
  label: "Date",
  lockedProperty: "locked",
  canToggleLock: (record) => !!record?._id,
};
const duration: DurationFormField<RecordValue> = {
  kind: "duration",
  name: "duration",
  label: "Duration",
  defaultValue: 90,
  quickOptions: [30, "1h"],
};
const fields: EditEntityField<RecordValue>[] = [
  text,
  select,
  selectMultiple,
  selectSingle,
  sourceBroadSelect,
  autocomplete,
  date,
  duration,
];
// Compile-only fixture: failures are TypeScript errors rather than runtime shape assertions.
void fields;
