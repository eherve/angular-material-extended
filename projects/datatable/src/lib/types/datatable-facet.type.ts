/** @format */

export type FacetOptionsOperator = 'count' | ['sum', string] | ['avg', string];

type BaseFacetOptions = {
  id: string;
  name?: string;
  position: 'start' | 'center' | 'end';
};

export type FacetOptionsOptions = {
  value: string;
  name?: string;
  color?: string;
  labelColor?: string;
};

type IndicatorFacetOptions = BaseFacetOptions & {
  kind: 'indicator';
  property: string;
  operator: FacetOptionsOperator;
};

export type ContentIdFacetOptions = IndicatorFacetOptions & {
  contentId?: string;
};
export type ProgressSpinnerFacetOptions = IndicatorFacetOptions & {
  display: 'progress-spinner';
  options?: FacetOptionsOptions[];
  size?: number;
  fontSize?: string;
};

export type ChipFacetOptions = IndicatorFacetOptions & {
  display: 'chips';
  options?: FacetOptionsOptions[];
  size?: number;
  fontSize?: string;
};

export type FacetOptions = ContentIdFacetOptions | ProgressSpinnerFacetOptions | ChipFacetOptions;
