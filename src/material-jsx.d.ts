import type { HTMLAttributes, Ref } from "react";

type El = HTMLAttributes<HTMLElement> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ref?: Ref<any>;
  class?: string;
  [attr: string]: unknown;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-filled-button": El;
      "md-filled-tonal-button": El;
      "md-outlined-button": El;
      "md-text-button": El;
      "md-chip-set": El;
      "md-filter-chip": El;
      "md-divider": El;
      "md-elevation": El;
      "md-icon": El;
      "md-slider": El;
      "md-switch": El;
      "md-outlined-text-field": El;
      "md-icon-button": El;
      "md-outlined-select": El;
      "md-select-option": El;
      "md-dialog": El;
      "md-tabs": El;
      "md-primary-tab": El;
      "md-checkbox": El;
    }
  }
}
