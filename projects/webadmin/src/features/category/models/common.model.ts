import { CacheModel } from "../../../models/common.model";

export interface ListRequestProjectModel {
  title: boolean;
  isActive: boolean
}

export interface ListRequestModel extends CacheModel {
  ids?: string[];
  limit?: number;
  skip?: number;
  project?: ListRequestProjectModel;
}

export interface ListItemModel {
  id: string;
  title?: string;
  isActive?: boolean;
}
