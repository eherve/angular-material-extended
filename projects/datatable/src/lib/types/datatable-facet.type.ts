/** @format */

import { NgxMatDatasourceResultFacet } from './datasource-service.type';

export type FacetOptionsOperator = 'count' | ['sum', string] | ['avg', string];

type BaseFacetOptions = {
  id: string;
  name?: string;
  position: 'start' | 'center' | 'end';
};

export type FacetOptionsOptions = {
  value: any;
  name?: string;
  color?: string;
  labelColor?: string;
};

type IndicatorFacetOptions = BaseFacetOptions & {
  kind: 'indicator';
  property: string;
  operator: FacetOptionsOperator;
  columnDef?: string;
};

export type ContentIdFacetOptions = IndicatorFacetOptions & {
  contentId?: string;
};
export type ProgressSpinnerFacetOptions = IndicatorFacetOptions & {
  display: 'progress-spinner';
  options?: FacetOptionsOptions[];
  size?: number;
  fontSize?: string;
  option?: (res: NgxMatDatasourceResultFacet) => FacetOptionsOptions | undefined;
};

export type ChipFacetOptions = IndicatorFacetOptions & {
  display: 'chips';
  options?: FacetOptionsOptions[];
  size?: number;
  fontSize?: string;
  option?: (res: NgxMatDatasourceResultFacet) => FacetOptionsOptions | undefined;
};

export type FacetOptions = ContentIdFacetOptions | ProgressSpinnerFacetOptions | ChipFacetOptions;
