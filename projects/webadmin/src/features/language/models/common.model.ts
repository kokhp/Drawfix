import { CacheModel } from "../../../models/common.model";

export interface ListRequestProjectModel {
  altName: boolean;
  iconText: boolean;
  isActive: boolean;
}

export interface ListRequestModel extends CacheModel {
  ids?: string[];
  limit?: number;
  skip?: number;
  project?: ListRequestProjectModel;
}

export interface ListItemModel {
  id: string;
  name: string;
  altName?: string;
  iconText?: string;
  isActive?: boolean;
}
