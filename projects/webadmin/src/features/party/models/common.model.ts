import { CacheModel } from "../../../models/common.model";

export interface ListRequestProjectModel {
  shortName: boolean;
  logoUrl: boolean;
  stateIds: boolean;
  isActive: boolean;
}

export interface ListRequestModel extends CacheModel {
  ids?: string[];
  limit?: number;
  skip?: number;
  project?: ListRequestProjectModel;
  skipEmptyStates?: boolean; // 👈 flag to ignore parties with empty stateIds
}

export interface ListItemModel {
  id: string;
  name: string;
  shortName?: string;
  logoUrl?: string;
  stateIds?: string[];
  isActive?: boolean;
}
