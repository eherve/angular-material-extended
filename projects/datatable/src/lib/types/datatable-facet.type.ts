/** @format */

export type FacetOptionsOperator = 'count' | ['sum', string] | ['avg', string];

type BaseFacetOptions = {
  id: string;
  name?: string;
  position: 'start' | 'center' | 'end';
};

export type FacetOptionsOptions = {
  _id: string;
  color?: string;
  name?: string;
};

export type IndicatorFacetOptions = BaseFacetOptions & {
  kind: 'indicator';
  property: string;
  operator: FacetOptionsOperator;

  options?: FacetOptionsOptions[];
  style?: (_id: string) => { color?: string; name?: string } | undefined;

  size?: number;
  fontSize?: string;

  contentId?:string
};

export type FacetOptions = IndicatorFacetOptions;
