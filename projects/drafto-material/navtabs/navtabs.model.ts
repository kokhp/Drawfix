import { Params } from "@angular/router";

export declare type DftNavTabItem = {
  id: string | number;
  label: string;
  routePath: string;
  queryParams?: Params;
  hidden?: boolean;
  disabled?: boolean;
}
